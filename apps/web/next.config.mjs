/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig = {
  output: 'standalone',
  // El navegador solo habla con /api del mismo dominio; Next reenvía a la API NestJS.
  // Así la cookie HttpOnly es de primera parte y el middleware puede leerla.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
