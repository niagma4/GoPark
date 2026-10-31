'use client';
import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { formatCOP, parseCOP } from '@/lib/utils';

/** Campo de dinero en pesos: muestra "$ 50.000" mientras se digita. */
export const MoneyInput = forwardRef<
  HTMLInputElement,
  { id: string; value: number | null; onChange: (v: number | null) => void; autoFocus?: boolean }
>(({ id, value, onChange, autoFocus }, ref) => (
  <Input
    ref={ref}
    id={id}
    inputMode="numeric"
    autoComplete="off"
    autoFocus={autoFocus}
    placeholder="$ 0"
    className="text-right text-xl font-semibold tabular-nums"
    value={value == null ? '' : formatCOP(value)}
    onChange={(e) => onChange(parseCOP(e.target.value))}
  />
));
MoneyInput.displayName = 'MoneyInput';
