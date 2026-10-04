// Server Actions for the authenticated app. All input is validated with zod
// (client input is untrusted). Money is stored as NUMERIC via strings —
// never floats. Failures return { ok: false, message } for the UI.

'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { REFERRAL_COOKIE, normalizeReferralCode } from '@/lib/referral-cookie';
import { CreateDeploymentSchema, WithdrawalQuoteSchema } from '@/lib/validation';
import { getPlan, quotePlan } from '@/lib/plans';
import { ASSET_IDS, DEPOSIT_CONFIG, getDepositAddress, isValidTxHash } from '@/lib/deposits';
import { getPortfolioSummary } from '@/lib/queries';
import { z } from 'zod';

export interface ActionResult {
  ok: boolean;
  message: string;
  ref?: string;
}

// Claims first-touch referral attribution for the CALLER only. Reads the
// transport cookie server-side and delegates every decision to the
// attach_referrer() database function (re-validates code, referrer, self,
// already-attached — the cookie is never trusted on its own). Idempotent:
// safe to run on every post-auth landing; attached/already/invalid/self all
// leave existing relationships untouched. Clears the cookie once consumed.
export async function claimReferral(): Promise<{ status: string }> {
  try {
    const code = normalizeReferralCode(cookies().get(REFERRAL_COOKIE)?.value ?? '');
    if (!code) return { status: 'none' };
    const supabase = createClient();
    const { data, error } = await supabase.rpc('attach_referrer', { p_code: code });
    if (error) return { status: 'error' };
    const status = typeof data === 'string' ? data : 'error';
    if (status === 'attached') {
      cookies().set(REFERRAL_COOKIE, '', { path: '/', maxAge: 0 });
    }
    return { status };
  } catch {
    return { status: 'error' };
  }
}

async function userId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function notify(
  supabase: ReturnType<typeof createClient>,
  uid: string,
  type: string,
  title: string,
  body?: string
) {
  try {
    await supabase.from('notifications').insert({ user_id: uid, type, title, body: body ?? null });
  } catch {
    // Notifications are best-effort; never fail the primary mutation.
  }
}

const DeploymentFormSchema = z.object({
  amount: z.coerce.number().positive().min(10).max(50000),
  plan: z.enum(['essential', 'premium', 'exclusive']),
});

export async function createDeployment(form: { amount: number; plan: string }): Promise<ActionResult> {
  const parsed = DeploymentFormSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Invalid deployment amount or module.' };
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  // Server-authoritative quote + plan-range + balance check (never trust the client).
  let quote;
  try {
    quote = quotePlan(parsed.data.plan, parsed.data.amount);
  } catch {
    return { ok: false, message: 'Amount is outside the selected module range.' };
  }
  const summary = await getPortfolioSummary();
  if (quote.amount > summary.available) {
    return { ok: false, message: `Insufficient available balance (${summary.available.toFixed(2)} USDT). Deposit funds first.` };
  }
  try {
    const supabase = createClient();
    const idempotencyKey = randomUUID();
    const validated = CreateDeploymentSchema.parse({
      amount: quote.amount,
      plan: quote.plan,
      asset: 'USDT',
      idempotencyKey,
    });
    const now = new Date();
    const planDef = getPlan(validated.plan);
    const cycleHours = planDef?.cycleHours ?? 6;
    const nextPayoutAt = new Date(now.getTime() + cycleHours * 3600 * 1000);
    const { data, error } = await supabase
      .from('deployments')
      .insert({
        user_id: uid,
        amount: validated.amount.toFixed(2),
        term_days: null,
        plan: validated.plan,
        asset: validated.asset,
        status: 'active',
        quoted_daily_rate: quote.ratePerCredit,
        started_at: now.toISOString(),
        matures_at: null,
        idempotency_key: validated.idempotencyKey,
        // Server-authoritative payout schedule: first credit due one cycle
        // after activation. The processor (pg_cron + settle-on-read) owns
        // everything after this; the browser never decides payouts.
        rate_per_credit: quote.ratePerCredit,
        cycle_hours: cycleHours,
        next_payout_at: nextPayoutAt.toISOString(),
        payouts_completed: 0,
        payouts_total: null,
        earned_total: '0.00',
      })
      .select('ref')
      .single();
    if (error) throw error;
    await supabase.from('wallet_transactions').insert({
      user_id: uid,
      type: 'deployment',
      asset: 'USDT',
      amount: validated.amount.toFixed(2),
      status: 'completed',
      meta: { deployment_ref: (data as { ref: string }).ref, plan: validated.plan },
    });
    await notify(supabase, uid, 'deployment', 'Deployment activated', `${(data as { ref: string }).ref} · ${validated.amount.toFixed(2)} USDT · ${getPlan(validated.plan)?.name ?? validated.plan}`);
    revalidatePath('/app');
    return { ok: true, message: 'Deployment activated.', ref: (data as { ref: string }).ref };
  } catch {
    return { ok: false, message: 'Could not activate the deployment. Please try again.' };
  }
}

const WithdrawFormSchema = z.object({
  amount: z.coerce.number().positive().max(100000),
  address: z.string().trim().min(8).max(128),
});

export async function requestWithdrawal(form: { amount: number; address: string }): Promise<ActionResult> {
  const withAsset = { ...form, asset: 'USDT', network: 'TRC20' };
  const addrParsed = WithdrawFormSchema.safeParse(form);
  const fullParsed = WithdrawalQuoteSchema.safeParse(withAsset);
  if (!addrParsed.success || !fullParsed.success) {
    return { ok: false, message: 'Enter a valid amount and destination address.' };
  }
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  const summary = await getPortfolioSummary();
  if (fullParsed.data.amount > summary.available) {
    return { ok: false, message: `Amount exceeds available balance (${summary.available.toFixed(2)} USDT).` };
  }
  try {
    const supabase = createClient();
    await supabase.from('wallet_transactions').insert({
      user_id: uid,
      type: 'withdrawal',
      asset: fullParsed.data.asset,
      amount: fullParsed.data.amount.toFixed(2),
      status: 'pending',
      network: fullParsed.data.network,
      address: fullParsed.data.address,
    });
    await notify(supabase, uid, 'withdrawal', 'Withdrawal requested', `${fullParsed.data.amount.toFixed(2)} USDT to ${fullParsed.data.address.slice(0, 10)}…`);
    revalidatePath('/app');
    return { ok: true, message: 'Withdrawal recorded as a pending request. On-chain broadcast activates with the execution layer; your balance hold is visible in the wallet.' };
  } catch {
    return { ok: false, message: 'Could not record the withdrawal. Please try again.' };
  }
}

const WalletFormSchema = z.object({
  asset: z.string().trim().min(2).max(10),
  network: z.string().trim().min(2).max(20),
  address: z.string().trim().min(8).max(128),
  label: z.string().trim().max(60).optional(),
});

export async function addWallet(form: { asset: string; network: string; address: string; label?: string }): Promise<ActionResult> {
  const parsed = WalletFormSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Enter a valid asset, network and address.' };
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  try {
    const supabase = createClient();
    const { error } = await supabase.from('wallets').insert({
      user_id: uid,
      asset: parsed.data.asset.toUpperCase(),
      network: parsed.data.network.toUpperCase(),
      address: parsed.data.address,
      label: parsed.data.label || null,
    });
    if (error) throw error;
    revalidatePath('/app/wallets');
    revalidatePath('/app/wallet');
    return { ok: true, message: 'Wallet saved. New addresses require verification before withdrawals can target them.' };
  } catch {
    return { ok: false, message: 'Could not save the wallet. Please try again.' };
  }
}

export async function removeWallet(id: string): Promise<ActionResult> {
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  try {
    const supabase = createClient();
    const { error } = await supabase.from('wallets').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/app/wallets');
    revalidatePath('/app/wallet');
    return { ok: true, message: 'Wallet removed.' };
  } catch {
    return { ok: false, message: 'Could not remove the wallet.' };
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    revalidatePath('/app/notifications');
  } catch {
    // Best-effort.
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    const uid = await userId();
    if (!uid) return;
    const supabase = createClient();
    await supabase.from('notifications').update({ read: true }).eq('user_id', uid).eq('read', false);
    revalidatePath('/app/notifications');
  } catch {
    // Best-effort.
  }
}

const DisplayNameSchema = z.object({ displayName: z.string().trim().min(1).max(60) });

export async function updateDisplayName(form: { displayName: string }): Promise<ActionResult> {
  const parsed = DisplayNameSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Display name must be 1–60 characters.' };
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  try {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ display_name: parsed.data.displayName }).eq('id', uid);
    if (error) throw error;
    revalidatePath('/app/profile');
    return { ok: true, message: 'Profile updated.' };
  } catch {
    return { ok: false, message: 'Could not update the profile.' };
  }
}

const TicketSchema = z.object({
  subject: z.string().trim().min(4).max(120),
  message: z.string().trim().min(10).max(4000),
  category: z.enum(['general', 'deposit', 'withdrawal', 'plans', 'referrals', 'security', 'other']).default('general'),
});

export async function createSupportTicket(form: { subject: string; message: string; category?: string }): Promise<ActionResult> {
  const parsed = TicketSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Give a subject (4+ characters) and a message (10+ characters).' };
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  try {
    const supabase = createClient();
    const { error } = await supabase.from('support_tickets').insert({
      user_id: uid,
      subject: parsed.data.subject,
      message: parsed.data.message,
      category: parsed.data.category,
    });
    if (error) throw error;
    await notify(supabase, uid, 'system', 'Support ticket opened', parsed.data.subject);
    return { ok: true, message: 'Ticket opened. We will follow up by email.' };
  } catch {
    return { ok: false, message: 'Could not open the ticket. Please try again.' };
  }
}

const UserReplySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
  key: z.string().trim().min(8).max(64),
});

// Authenticated user reply on their own ticket. A reply reopens the ticket
// (open) so it returns to the admin queue. Idempotent per client key.
export async function replyToSupportTicket(form: { ticketId: string; body: string; key: string }): Promise<ActionResult> {
  const parsed = UserReplySchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Reply must be 1–4000 characters.' };
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  try {
    const supabase = createClient();
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id,user_id')
      .eq('id', parsed.data.ticketId)
      .maybeSingle();
    const t = ticket as { id: string; user_id: string | null } | null;
    if (!t || t.user_id !== uid) return { ok: false, message: 'Ticket not found.' };
    const { data: existing } = await supabase
      .from('ticket_messages')
      .select('id')
      .eq('ticket_id', parsed.data.ticketId)
      .eq('idempotency_key', parsed.data.key)
      .maybeSingle();
    if (existing) return { ok: true, message: 'Reply already sent.' };
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: parsed.data.ticketId,
      sender: 'user',
      sender_id: uid,
      body: parsed.data.body,
      internal: false,
      idempotency_key: parsed.data.key,
    });
    if (error) throw error;
    await supabase
      .from('support_tickets')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', parsed.data.ticketId);
    await notify(supabase, uid, 'support', 'Reply sent', 'Support will follow up shortly.');
    revalidatePath('/app/support');
    return { ok: true, message: 'Reply sent.' };
  } catch {
    return { ok: false, message: 'Could not send the reply.' };
  }
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  body: string;
  createdAt: string;
}

// Owned conversation read for the caller's own ticket (server action so the
// browser never touches privileged reads; RLS + explicit ownership check).
export async function getMyTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const uid = await userId();
  if (!uid) return [];
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId)) return [];
  try {
    const supabase = createClient();
    const { data: ticket } = await supabase.from('support_tickets').select('id,user_id').eq('id', ticketId).maybeSingle();
    const t = ticket as { id: string; user_id: string | null } | null;
    if (!t || t.user_id !== uid) return [];
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('id,sender,body,created_at')
      .eq('ticket_id', ticketId)
      .eq('internal', false)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map((m) => ({
      id: String(m.id),
      sender: m.sender === 'admin' ? 'admin' : 'user',
      body: String(m.body ?? ''),
      createdAt: String(m.created_at ?? ''),
    }));
  } catch {
    return [];
  }
}

const TxSubmitSchema = z.object({
  assetId: z.string(),
  amount: z.coerce.number().positive().max(100000000),
  txHash: z.string().trim().min(16).max(128),
});

// User submits the blockchain transaction hash (TXID) after sending funds
// to the configured deposit address. This creates a PENDING deposit record
// for review — it never credits anything by itself. The TXID is verified
// (existence, network, recipient, asset, amount, confirmations) before any
// credit; duplicates are rejected by the (network, tx_hash) unique index.
export async function submitDepositTx(form: { assetId: string; amount: number; txHash: string }): Promise<ActionResult> {
  const parsed = TxSubmitSchema.safeParse(form);
  if (!parsed.success) return { ok: false, message: 'Enter a valid amount and transaction hash.' };
  const { assetId, amount, txHash } = parsed.data;
  if (!((ASSET_IDS as readonly string[]).includes(assetId))) {
    return { ok: false, message: 'Unknown deposit asset.' };
  }
  const cleanHash = txHash.trim().toLowerCase();
  if (!isValidTxHash(assetId, cleanHash)) {
    return { ok: false, message: 'That transaction hash does not match the expected format for this network.' };
  }
  const cfg = DEPOSIT_CONFIG[assetId as (typeof ASSET_IDS)[number]];
  const address = getDepositAddress(assetId);
  if (!address) return { ok: false, message: 'This deposit method is not configured right now.' };
  if (amount < 10) return { ok: false, message: 'Minimum deposit is $10.00.' };
  const uid = await userId();
  if (!uid) return { ok: false, message: 'Session expired. Please sign in again.' };
  try {
    const supabase = createClient();
    const { error } = await supabase.from('wallet_transactions').insert({
      user_id: uid,
      type: 'deposit',
      asset: cfg.symbol,
      amount: amount.toFixed(2),
      status: 'pending',
      network: cfg.network,
      address,
      tx_hash: cleanHash,
      meta: { asset_id: assetId, standard: cfg.standard },
    });
    if (error) {
      if ((error as { code?: string }).code === '23505') {
        return { ok: false, message: 'This transaction was already submitted and is being processed.' };
      }
      throw error;
    }
    await notify(supabase, uid, 'deposit', 'Transaction submitted', `${amount.toFixed(2)} ${cfg.symbol} · ${cfg.network} · awaiting review`);
    revalidatePath('/app');
    return { ok: true, message: 'Transaction submitted. It will be credited after on-chain verification and review.' };
  } catch {
    return { ok: false, message: 'Could not submit the transaction. Please try again.' };
  }
}
