'use client';
import { LogOut, ParkingSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { post } from '@/lib/api';
import type { User } from '@/lib/types';

export function AppHeader({ user, section }: { user: User | null; section: string }) {
  const router = useRouter();
  const logout = async () => {
    await post('/auth/logout').catch(() => undefined);
    router.replace('/login');
    router.refresh();
  };
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <ParkingSquare className="h-7 w-7 text-brand-600" aria-hidden />
          <span className="text-lg font-extrabold tracking-tight">GoPark</span>
          <span className="hidden text-sm text-slate-400 sm:inline">/ {section}</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <Badge tone={user.role === 'ADMIN' ? 'blue' : 'slate'}>{user.role === 'ADMIN' ? 'Administrador' : 'Operador'}</Badge>
            <Button variant="ghost" className="h-9 px-3" onClick={logout} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
