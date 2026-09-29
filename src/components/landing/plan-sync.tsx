'use client';

// Shared plan selection: module cards write, simulator reads. One source of
// truth for the selected plan across the homepage explorer.

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PlanKey } from '@/lib/plans';

const PlanSyncContext = createContext<{ plan: PlanKey; setPlan: (p: PlanKey) => void }>({
  plan: 'premium',
  setPlan: () => {},
});

export function PlanSyncProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanKey>('premium');
  return <PlanSyncContext.Provider value={{ plan, setPlan }}>{children}</PlanSyncContext.Provider>;
}

export function usePlanSync() {
  return useContext(PlanSyncContext);
}
