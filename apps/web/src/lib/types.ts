export type Role = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type CashResult = 'CUADRADO' | 'FALTANTE' | 'SOBRANTE';

export interface CashShift {
  id: string;
  userId: string;
  status: 'OPEN' | 'CLOSED';
  openingAmount: number;
  cashCollected: number;
  expectedAmount: number | null;
  declaredAmount: number | null;
  difference: number | null;
  notes: string | null;
  openedAt: string;
  closedAt: string | null;
  user: { id: string; name: string; email: string };
  result?: CashResult;
}

/** Página de inicio según el rol (HU-01). */
export const homeForRole = (role: Role) => (role === 'ADMIN' ? '/admin' : '/caja');

export const resultOf = (difference: number | null): CashResult | null =>
  difference == null ? null : difference === 0 ? 'CUADRADO' : difference < 0 ? 'FALTANTE' : 'SOBRANTE';
