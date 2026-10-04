// Admin mutations (server only). Every state change writes an audit_logs
// row with the acting admin. Financial credits happen ONLY by moving a
// deposit record pending -> completed (the same row the balance engine
// derives), so a transaction can never credit twice.
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminId } from '@/lib/admin';

export interface AdminResult {
  ok: boolean;
  message: string;
}

async function audit(
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  action: string,
  entity: string,
  entityId: string,
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: adminId,
      action,
      entity,
      entity_id: entityId,
      meta: meta ?? {},
    });
  } catch {
    // Audit is best-effort; the primary mutation result stands.
  }
}

export async function confirmDeposit(id: string): Promise<AdminResult> {
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('wallet_transactions')
      .select('id,status,type,asset,amount,user_id,provider,meta')
      .eq('id', id)
      .maybeSingle();
    const r = row as {
      id: string; status: string; type: string; asset: string; amount: string; user_id: string;
      provider: string | null; meta: Record<string, unknown> | null;
    } | null;
    if (!r || r.type !== 'deposit') return { ok: false, message: 'Deposit not found.' };
    if (r.status === 'completed') return { ok: true, message: 'Already credited — no duplicate entry created.' };
    if (r.status !== 'pending') return { ok: false, message: `Only pending deposits can be confirmed (now ${r.status}).` };
    // Automatic provider deposits credit themselves via verified IPN — a
    // manual confirm would invent money movement the provider never
    // reported. Only flagged exceptions (needs review) may be confirmed.
    if (r.provider === 'nowpayments') {
      const meta = r.meta ?? {};
      const flagged = (meta as { needs_review?: unknown }).needs_review === true;
      const pStatus = typeof (meta as { provider_status?: unknown }).provider_status === 'string'
        ? (meta as { provider_status: string }).provider_status
        : null;
      const exception = flagged || (pStatus !== null && ['partially_paid', 'failed', 'expired', 'refunded'].includes(pStatus));
      if (!exception) {
        return { ok: false, message: 'Automatic provider deposit — it credits itself on provider confirmation. No manual action.' };
      }
    }
    const { error } = await supabase
      .from('wallet_transactions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending');
    if (error) throw error;
    await audit(supabase, adminId, 'DEPOSIT_CONFIRMED', 'deposit', id, { amount: r.amount, asset: r.asset, user_id: r.user_id });
    revalidatePath('/admin');
    return { ok: true, message: 'Deposit confirmed and credited exactly once.' };
  } catch {
    return { ok: false, message: 'Could not confirm the deposit.' };
  }
}

const RejectSchema = z.object({ id: z.string().uuid(), reason: z.string().trim().max(500).optional() });

export async function rejectDeposit(form: { id: string; reason?: string }): Promise<AdminResult> {
  const parsed = RejectSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Invalid request.' };
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('wallet_transactions')
      .select('id,status,type')
      .eq('id', parsed.data.id)
      .maybeSingle();
    const r = row as { id: string; status: string; type: string } | null;
    if (!r || r.type !== 'deposit') return { ok: false, message: 'Deposit not found.' };
    if (r.status !== 'pending') return { ok: false, message: `Only pending deposits can be rejected (now ${r.status}).` };
    const { error } = await supabase
      .from('wallet_transactions')
      .update({ status: 'rejected' })
      .eq('id', parsed.data.id)
      .eq('status', 'pending');
    if (error) throw error;
    await audit(supabase, adminId, 'DEPOSIT_REJECTED', 'deposit', parsed.data.id, { reason: parsed.data.reason ?? null });
    revalidatePath('/admin');
    return { ok: true, message: 'Deposit rejected. No credit was created.' };
  } catch {
    return { ok: false, message: 'Could not reject the deposit.' };
  }
}

const WithdrawalSchema = z.object({
  id: z.string().uuid(),
  to: z.enum(['processing', 'completed', 'cancelled']),
  txHash: z.string().trim().max(128).optional(),
});

export async function setWithdrawalStatus(form: { id: string; to: 'processing' | 'completed' | 'cancelled'; txHash?: string }): Promise<AdminResult> {
  const parsed = WithdrawalSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Invalid request.' };
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  try {
    const supabase = createClient();
    const { data: row } = await supabase
      .from('wallet_transactions')
      .select('id,status,type')
      .eq('id', parsed.data.id)
      .maybeSingle();
    const r = row as { id: string; status: string; type: string } | null;
    if (!r || r.type !== 'withdrawal') return { ok: false, message: 'Withdrawal not found.' };
    // Approval (pending->processing) is separate from broadcast/sent (->completed).
    const allowed: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
    };
    if (!(allowed[r.status] ?? []).includes(parsed.data.to)) {
      return { ok: false, message: `Cannot move withdrawal from ${r.status} to ${parsed.data.to}.` };
    }
    const patch: Record<string, unknown> = { status: parsed.data.to };
    if (parsed.data.to === 'completed') {
      patch.completed_at = new Date().toISOString();
      if (parsed.data.txHash) patch.tx_hash = parsed.data.txHash.trim().toLowerCase();
    }
    const { error } = await supabase.from('wallet_transactions').update(patch).eq('id', parsed.data.id).eq('status', r.status);
    if (error) throw error;
    await audit(supabase, adminId, `WITHDRAWAL_${parsed.data.to.toUpperCase()}`, 'withdrawal', parsed.data.id, {
      from: r.status,
      txHash: parsed.data.txHash ?? null,
    });
    revalidatePath('/admin');
    return { ok: true, message: `Withdrawal marked ${parsed.data.to}.` };
  } catch {
    return { ok: false, message: 'Could not update the withdrawal.' };
  }
}

const NetworkSchema = z.object({
  id: z.string().min(2).max(32),
  depositAddress: z.string().trim().max(128),
  tokenContract: z.string().trim().max(128).optional(),
  memoRequired: z.boolean(),
  memoLabel: z.string().trim().max(60).optional(),
  confirmations: z.coerce.number().int().min(0).max(1000),
  minimum: z.coerce.number().min(0).max(100000000),
  depositEnabled: z.boolean(),
  withdrawalEnabled: z.boolean(),
});

export async function updateNetwork(form: Record<string, unknown>): Promise<AdminResult> {
  const parsed = NetworkSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Invalid network configuration.' };
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  const n = parsed.data;
  if (n.depositEnabled && !n.depositAddress) {
    return { ok: false, message: 'A deposit address is required before enabling deposits.' };
  }
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('crypto_networks')
      .update({
        deposit_address: n.depositAddress,
        token_contract_address: n.tokenContract || null,
        memo_required: n.memoRequired,
        memo_label: n.memoLabel || null,
        confirmations_required: n.confirmations,
        minimum_deposit: n.minimum,
        deposit_enabled: n.depositEnabled,
        withdrawal_enabled: n.withdrawalEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', n.id);
    if (error) throw error;
    await audit(supabase, adminId, 'NETWORK_UPDATED', 'crypto_network', n.id, {
      depositEnabled: n.depositEnabled,
      withdrawalEnabled: n.withdrawalEnabled,
      addressSet: n.depositAddress.length > 0,
    });
    revalidatePath('/admin');
    revalidatePath('/app/deposit');
    return { ok: true, message: 'Network configuration saved.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('networks_enabled_needs_address')) {
      return { ok: false, message: 'Deposit address missing — network left disabled.' };
    }
    return { ok: false, message: 'Could not save the network.' };
  }
}

const TicketReplySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
  key: z.string().trim().min(8).max(64),
  internal: z.boolean().optional().default(false),
});

// Admin reply (or internal note) on a support ticket. Idempotent per
// (ticket, client key): double-clicks and retries converge to one message.
// Message persistence and user notification are separated — a notification
// failure never rolls back a stored reply.
export async function replyToTicket(form: { ticketId: string; body: string; key: string; internal?: boolean }): Promise<AdminResult> {
  const parsed = TicketReplySchema.safeParse({ ...form, internal: form.internal ?? false });
  if (!parsed.success) return { ok: false, message: 'Reply must be 1–4000 characters.' };
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  const { ticketId, body, key, internal } = parsed.data;
  try {
    const supabase = createClient();
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id,status,user_id,subject')
      .eq('id', ticketId)
      .maybeSingle();
    const t = ticket as { id: string; status: string; user_id: string | null; subject: string } | null;
    if (!t) return { ok: false, message: 'Ticket not found.' };
    const { data: existing } = await supabase
      .from('ticket_messages')
      .select('id')
      .eq('ticket_id', ticketId)
      .eq('idempotency_key', key)
      .maybeSingle();
    if (existing) return { ok: true, message: internal ? 'Note already saved.' : 'Reply already sent.' };
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: ticketId,
      sender: 'admin',
      sender_id: adminId,
      body,
      internal,
      idempotency_key: key,
    });
    if (error) throw error;
    // Admin activity moves the ticket to answered (reopens closed ones);
    // internal notes leave status untouched.
    const patch: Record<string, string> = { updated_at: new Date().toISOString() };
    if (!internal) patch.status = 'answered';
    await supabase.from('support_tickets').update(patch).eq('id', ticketId);
    await audit(supabase, adminId, internal ? 'TICKET_NOTE' : 'TICKET_REPLY', 'ticket', ticketId, { status: t.status });
    if (!internal && t.user_id) {
      try {
        await supabase.from('notifications').insert({
          user_id: t.user_id,
          type: 'support',
          title: 'Support replied',
          body: t.subject,
        });
      } catch {
        // Notification is best-effort; the stored reply stands.
      }
    }
    revalidatePath('/admin/support');
    return { ok: true, message: internal ? 'Internal note saved.' : 'Reply sent.' };
  } catch {
    return { ok: false, message: 'Could not save the reply.' };
  }
}

const TicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  to: z.enum(['open', 'answered', 'closed']),
});

export async function setTicketStatus(form: { ticketId: string; to: 'open' | 'answered' | 'closed' }): Promise<AdminResult> {
  const parsed = TicketStatusSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Invalid status.' };
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: parsed.data.to, updated_at: new Date().toISOString() })
      .eq('id', parsed.data.ticketId);
    if (error) throw error;
    await audit(supabase, adminId, 'TICKET_STATUS', 'ticket', parsed.data.ticketId, { to: parsed.data.to });
    revalidatePath('/admin/support');
    return { ok: true, message: `Ticket ${parsed.data.to}.` };
  } catch {
    return { ok: false, message: 'Could not change the ticket status.' };
  }
}

const SettingSchema = z.object({ key: z.string().min(1).max(80), value: z.string().max(2000) });

export async function updateSetting(form: { key: string; value: string }): Promise<AdminResult> {
  const parsed = SettingSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Invalid setting.' };
  const adminId = await requireAdminId();
  if (!adminId) return { ok: false, message: 'Unauthorized.' };
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('platform_settings')
      .update({ value: parsed.data.value, updated_at: new Date().toISOString() })
      .eq('key', parsed.data.key);
    if (error) throw error;
    await audit(supabase, adminId, 'SETTING_UPDATED', 'platform_setting', parsed.data.key, { value: parsed.data.value });
    revalidatePath('/admin');
    return { ok: true, message: 'Setting saved.' };
  } catch {
    return { ok: false, message: 'Could not save the setting.' };
  }
}
