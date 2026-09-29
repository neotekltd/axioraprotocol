import { z } from 'zod';
import { PLANS } from './plans';

const planKeys = PLANS.map((p) => p.key) as [string, ...string[]];

export const CalculatorQuerySchema = z.object({
  amount: z.coerce.number().positive().min(10).max(50000),
  plan: z.enum(planKeys),
});

export const CreateDeploymentSchema = z.object({
  amount: z.number().positive().min(10).max(50000),
  plan: z.enum(planKeys),
  asset: z.enum(['USDT', 'BTC', 'ETH', 'BNB']).default('USDT'),
  idempotencyKey: z.string().uuid(),
});

export const WithdrawalQuoteSchema = z.object({
  amount: z.number().positive(),
  asset: z.string().min(3).max(10),
  network: z.string().min(2).max(20),
  address: z.string().min(8).max(128),
});

export type CreateDeploymentInput = z.infer<typeof CreateDeploymentSchema>;
