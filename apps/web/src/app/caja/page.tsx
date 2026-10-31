'use client';
import { Clock, LogIn, Lock, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { MoneyInput } from '@/components/money-input';
import { ErrorAlert } from '@/components/ui/alert';
import { ResultBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, Stat } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/input';
import { api, ApiError, post } from '@/lib/api';
import type { CashShift, User } from '@/lib/types';
import { formatCOP, formatDateTime } from '@/lib/utils';

/**
 * Vista de caja del operador (HU-02).
 * Estados: sin turno → modal de apertura · turno abierto → operación y cierre · turno cerrado → resumen de arqueo.
 */
export default function CajaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shift, setShift] = useState<CashShift | null>(null);
  const [closed, setClosed] = useState<CashShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ user }, { shift }] = await Promise.all([
        api<{ user: User }>('/auth/me'),
        api<{ shift: CashShift | null }>('/shifts/current'),
      ]);
      setUser(user);
      setShift(shift);
      setOpenDialog(!shift);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AppHeader user={user} section="Caja" />
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {loading ? (
          <p className="text-slate-500">Cargando…</p>
        ) : closed ? (
          <CloseSummary
            shift={closed}
            onNew={() => {
              setClosed(null);
              setOpenDialog(true);
            }}
          />
        ) : shift ? (
          <OpenShiftView shift={shift} onClose={() => setCloseDialog(true)} />
        ) : (
          <Card className="mx-auto max-w-lg p-8 text-center">
            <Lock className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
            <h1 className="mt-3 text-xl font-bold">No tiene un turno abierto</h1>
            <p className="mt-1 text-sm text-slate-500">
              Para registrar entradas o cobros debe abrir un turno de caja con la base de efectivo inicial.
            </p>
            <Button className="mt-6" onClick={() => setOpenDialog(true)}>
              <Wallet className="h-4 w-4" /> Abrir turno
            </Button>
          </Card>
        )}
      </main>

      <OpenShiftDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onOpened={(s) => {
          setShift(s);
          setOpenDialog(false);
        }}
      />
      {shift && (
        <CloseShiftDialog
          open={closeDialog}
          shift={shift}
          onClose={() => setCloseDialog(false)}
          onClosed={(s) => {
            setClosed(s);
            setShift(null);
            setCloseDialog(false);
          }}
        />
      )}
    </>
  );
}

function OpenShiftView({ shift, onClose }: { shift: CashShift; onClose: () => void }) {
  const expected = shift.openingAmount + shift.cashCollected;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <h1 className="text-xl font-bold">Operación del parqueadero</h1>
        <p className="mt-1 text-sm text-slate-500">El registro de entradas y salidas se habilita en el Sprint 2 (HU-03 y HU-04).</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" disabled className="h-20 text-base">
            <LogIn className="h-5 w-5" /> Registrar entrada
          </Button>
          <Button variant="outline" disabled className="h-20 text-base">
            <Wallet className="h-5 w-5" /> Cobrar salida
          </Button>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Turno de caja</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Abierto
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> Desde {formatDateTime(shift.openedAt)}
        </p>
        <div className="mt-4 grid gap-3">
          <Stat label="Base inicial" value={formatCOP(shift.openingAmount)} />
          <Stat label="Efectivo recaudado" value={formatCOP(shift.cashCollected)} />
          <Stat label="Total esperado en caja" value={formatCOP(expected)} />
        </div>
        <Button variant="danger" className="mt-6 w-full" onClick={onClose}>
          Cerrar turno
        </Button>
      </Card>
    </div>
  );
}

function OpenShiftDialog({ open, onClose, onOpened }: { open: boolean; onClose: () => void; onOpened: (s: CashShift) => void }) {
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (amount == null) return setError('Ingrese la base de efectivo (puede ser $ 0)');
    setLoading(true);
    setError(null);
    try {
      onOpened(await post<CashShift>('/shifts/open', { openingAmount: amount }));
      setAmount(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo abrir el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Abrir turno de caja" description="Cuente el efectivo con el que inicia la jornada.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="opening">Base de efectivo inicial</Label>
          <MoneyInput id="opening" value={amount} onChange={setAmount} autoFocus />
        </div>
        <ErrorAlert message={error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Abrir turno
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function CloseShiftDialog({
  open,
  shift,
  onClose,
  onClosed,
}: {
  open: boolean;
  shift: CashShift;
  onClose: () => void;
  onClosed: (s: CashShift) => void;
}) {
  const [declared, setDeclared] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (declared == null) return setError('Ingrese el efectivo contado');
    setLoading(true);
    setError(null);
    try {
      onClosed(await post<CashShift>('/shifts/close', { declaredAmount: declared, notes: notes || undefined }));
      setDeclared(null);
      setNotes('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cerrar el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cerrar turno"
      description={`Turno abierto el ${formatDateTime(shift.openedAt)}. Cuente el efectivo en caja y declárelo; el sistema lo comparará con el total esperado.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="declared">Efectivo contado</Label>
          <MoneyInput id="declared" value={declared} onChange={setDeclared} autoFocus />
        </div>
        <div>
          <Label htmlFor="notes">Observaciones (opcional)</Label>
          <textarea
            id="notes"
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <ErrorAlert message={error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Cerrar turno
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function CloseSummary({ shift, onNew }: { shift: CashShift; onNew: () => void }) {
  const diff = shift.difference ?? 0;
  return (
    <Card className="mx-auto max-w-2xl p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Resumen de cierre de turno</h1>
        <ResultBadge result={shift.result ?? null} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {formatDateTime(shift.openedAt)} → {formatDateTime(shift.closedAt)} · {shift.user.name}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Stat label="Base inicial" value={formatCOP(shift.openingAmount)} />
        <Stat label="Efectivo recaudado" value={formatCOP(shift.cashCollected)} />
        <Stat label="Total esperado" value={formatCOP(shift.expectedAmount)} />
        <Stat label="Efectivo declarado" value={formatCOP(shift.declaredAmount)} />
      </div>
      <div className="mt-3">
        <Stat
          label="Diferencia (declarado − esperado)"
          value={`${diff > 0 ? '+' : ''}${formatCOP(diff)}`}
          tone={diff === 0 ? 'ok' : diff < 0 ? 'bad' : 'warn'}
        />
      </div>
      {shift.notes && <p className="mt-4 text-sm text-slate-600">Observaciones: {shift.notes}</p>}
      <Button className="mt-6" onClick={onNew}>
        Abrir nuevo turno
      </Button>
    </Card>
  );
}
