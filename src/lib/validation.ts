import { z } from 'zod';

export const CalculatorQuerySchema = z.object({
  amount: z.coerce.number().positive().min(10).max(100000),
  termDays: z.coerce.number().int().min(20).max(90),
});

export const CreateDeploymentSchema = z.object({
  amount: z.number().positive().min(10).max(100000),
  termDays: z.number().int().min(20).max(90),
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
