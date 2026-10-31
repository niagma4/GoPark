'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { Badge, ResultBadge } from '@/components/ui/badge';
import { Card, Stat } from '@/components/ui/card';
import { api, ApiError } from '@/lib/api';
import { resultOf, type CashShift, type User } from '@/lib/types';
import { formatCOP, formatDateTime } from '@/lib/utils';

/**
 * Área del administrador. Sprint 1: auditoría de turnos de caja (HU-02) y usuarios (HU-01).
 * El dashboard de ocupación e ingresos llega en el Sprint 4 (HU-07).
 */
export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<CashShift[]>([]);
  const [users, setUsers] = useState<(User & { active: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ user: User }>('/auth/me'),
      api<CashShift[]>('/shifts'),
      api<(User & { active: boolean })[]>('/users'),
    ])
      .then(([me, s, u]) => {
        setUser(me.user);
        setShifts(s);
        setUsers(u);
      })
      .catch((e) => e instanceof ApiError && e.status === 401 && router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const open = shifts.filter((s) => s.status === 'OPEN').length;
  const closed = shifts.filter((s) => s.status === 'CLOSED');
  const totalDiff = closed.reduce((acc, s) => acc + (s.difference ?? 0), 0);

  return (
    <>
      <AppHeader user={user} section="Administración" />
      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold">Auditoría de turnos de caja</h1>
          <p className="text-sm text-slate-500">Arqueo de cada turno: total esperado frente al efectivo declarado por el cajero.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Turnos abiertos" value={String(open)} />
          <Stat label="Turnos cerrados" value={String(closed.length)} />
          <Stat
            label="Diferencia acumulada"
            value={`${totalDiff > 0 ? '+' : ''}${formatCOP(totalDiff)}`}
            tone={totalDiff === 0 ? 'ok' : totalDiff < 0 ? 'bad' : 'warn'}
          />
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {['Cajero', 'Apertura', 'Cierre', 'Base', 'Esperado', 'Declarado', 'Diferencia', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Cargando…
                  </td>
                </tr>
              )}
              {!loading && shifts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Aún no hay turnos registrados.
                  </td>
                </tr>
              )}
              {shifts.map((s) => (
                <tr key={s.id} className="tabular-nums">
                  <td className="px-4 py-3 font-medium">{s.user.name}</td>
                  <td className="px-4 py-3">{formatDateTime(s.openedAt)}</td>
                  <td className="px-4 py-3">{formatDateTime(s.closedAt)}</td>
                  <td className="px-4 py-3">{formatCOP(s.openingAmount)}</td>
                  <td className="px-4 py-3">{formatCOP(s.expectedAmount)}</td>
                  <td className="px-4 py-3">{formatCOP(s.declaredAmount)}</td>
                  <td className="px-4 py-3">{s.difference == null ? '—' : `${s.difference > 0 ? '+' : ''}${formatCOP(s.difference)}`}</td>
                  <td className="px-4 py-3">
                    {s.status === 'OPEN' ? <Badge tone="blue">Abierto</Badge> : <ResultBadge result={resultOf(s.difference)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold">Usuarios</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="font-medium">{u.name}</span> <span className="text-slate-500">· {u.email}</span>
                </span>
                <Badge tone={u.role === 'ADMIN' ? 'blue' : 'slate'}>{u.role === 'ADMIN' ? 'Administrador' : 'Operador'}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </>
  );
}
