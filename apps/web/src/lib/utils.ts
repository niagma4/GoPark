import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** 50000 → "$ 50.000" */
export const formatCOP = (value: number | null | undefined) => (value == null ? '—' : cop.format(value));

/** "$ 50.000" → 50000 (solo dígitos; los pesos no tienen centavos en caja) */
export const parseCOP = (text: string) => {
  const digits = text.replace(/\D/g, '');
  return digits === '' ? null : Number(digits);
};

const dt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' });
export const formatDateTime = (iso: string | null | undefined) => (iso ? dt.format(new Date(iso)) : '—');
