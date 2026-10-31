import type { Metadata } from 'next';
// Fuente autoalojada (npm): no depende de Google Fonts en build ni en producción
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoPark — Gestión de parqueaderos',
  description: 'Control vehicular, turnos de caja y métricas para parqueaderos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
