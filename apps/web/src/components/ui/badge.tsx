import { cn } from '@/lib/utils';

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

export function Badge({ tone = 'slate', children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone])}>
      {children}
    </span>
  );
}

export function ResultBadge({ result }: { result: 'CUADRADO' | 'FALTANTE' | 'SOBRANTE' | null }) {
  if (!result) return <Badge>—</Badge>;
  const tone = result === 'CUADRADO' ? 'green' : result === 'FALTANTE' ? 'red' : 'amber';
  return <Badge tone={tone}>{result === 'CUADRADO' ? 'Cuadrado' : result === 'FALTANTE' ? 'Faltante' : 'Sobrante'}</Badge>;
}
