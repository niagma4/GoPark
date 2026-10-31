/**
 * Datos semilla: usuarios demo para probar el Sprint 1.
 * Ejecutar con:  npm run prisma:seed
 * Es idempotente (upsert): se puede correr varias veces.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const demoUsers = [
  { name: 'Administrador GoPark', email: 'admin@gopark.co', password: 'Admin123*', role: Role.ADMIN },
  { name: 'Operador Caja 1', email: 'operador@gopark.co', password: 'Operador123*', role: Role.OPERATOR },
];

async function main() {
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, active: true },
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
    console.log(`✔ ${u.role.padEnd(8)} ${u.email} / ${u.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
