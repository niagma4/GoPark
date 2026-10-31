/** Roles del sistema (espejo del enum `Role` de Prisma). */
export const Role = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** Datos del usuario autenticado que viajan en el JWT. */
export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: Role;
}
