/**
 * Pruebas end-to-end de la API contra una base PostgreSQL real.
 * Requiere DATABASE_URL con la migración aplicada y el seed ejecutado:
 *   npx prisma migrate deploy && npm run prisma:seed && npm run test:e2e
 */
import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-pruebas';

describe('GoPark API — Sprint 1 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let operatorCookie: string;
  let adminCookie: string;

  const login = async (email: string, password: string) => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(200);
    return (res.headers['set-cookie'] as unknown as string[])[0];
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.cashShift.deleteMany();
    operatorCookie = await login('operador@gopark.co', 'Operador123*');
    adminCookie = await login('admin@gopark.co', 'Admin123*');
  });

  afterAll(async () => {
    await prisma.cashShift.deleteMany();
    await app.close();
  });

  describe('HU-01 Autenticación y roles', () => {
    it('guarda el JWT en una cookie HttpOnly', () => {
      expect(operatorCookie).toMatch(/^gopark_token=/);
      expect(operatorCookie).toMatch(/HttpOnly/i);
    });

    it('rechaza credenciales inválidas', () =>
      request(app.getHttpServer()).post('/auth/login').send({ email: 'operador@gopark.co', password: 'malaClave1' }).expect(401));

    it('valida el formato del login', () =>
      request(app.getHttpServer()).post('/auth/login').send({ email: 'no-es-correo', password: 'x' }).expect(400));

    it('protege las rutas: sin cookie responde 401', () => request(app.getHttpServer()).get('/auth/me').expect(401));

    it('devuelve el usuario autenticado con su rol', async () => {
      const res = await request(app.getHttpServer()).get('/auth/me').set('Cookie', operatorCookie).expect(200);
      expect(res.body.user).toMatchObject({ email: 'operador@gopark.co', role: 'OPERATOR' });
    });

    it('el operador no accede a rutas de administración (403)', () =>
      request(app.getHttpServer()).get('/users').set('Cookie', operatorCookie).expect(403));

    it('el administrador sí accede a rutas de administración', async () => {
      const res = await request(app.getHttpServer()).get('/users').set('Cookie', adminCookie).expect(200);
      expect(res.body[0]).not.toHaveProperty('passwordHash');
    });

    it('el administrador no opera la caja (403)', () =>
      request(app.getHttpServer()).post('/shifts/open').set('Cookie', adminCookie).send({ openingAmount: 1000 }).expect(403));
  });

  describe('HU-02 Turnos de caja', () => {
    it('no hay turno abierto al inicio', async () => {
      const res = await request(app.getHttpServer()).get('/shifts/current').set('Cookie', operatorCookie).expect(200);
      expect(res.body.shift).toBeNull();
    });

    it('rechaza una base negativa', () =>
      request(app.getHttpServer()).post('/shifts/open').set('Cookie', operatorCookie).send({ openingAmount: -5 }).expect(400));

    it('dos aperturas simultáneas: solo una se acepta', async () => {
      const send = () =>
        request(app.getHttpServer()).post('/shifts/open').set('Cookie', operatorCookie).send({ openingAmount: 50000 });
      const codes = (await Promise.all([send(), send()])).map((r) => r.status).sort();
      expect(codes).toEqual([201, 409]);
    });

    it('no permite abrir un segundo turno', () =>
      request(app.getHttpServer()).post('/shifts/open').set('Cookie', operatorCookie).send({ openingAmount: 1000 }).expect(409));

    it('cierra el turno comparando esperado vs. declarado', async () => {
      const res = await request(app.getHttpServer())
        .post('/shifts/close')
        .set('Cookie', operatorCookie)
        .send({ declaredAmount: 48000, notes: 'Faltó cambio' })
        .expect(200);
      expect(res.body).toMatchObject({
        status: 'CLOSED', openingAmount: 50000, expectedAmount: 50000, declaredAmount: 48000, difference: -2000, result: 'FALTANTE',
      });
    });

    it('no permite cerrar si no hay turno abierto', () =>
      request(app.getHttpServer()).post('/shifts/close').set('Cookie', operatorCookie).send({ declaredAmount: 0 }).expect(404));

    it('el administrador audita los turnos cerrados', async () => {
      const res = await request(app.getHttpServer()).get('/shifts?status=CLOSED').set('Cookie', adminCookie).expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].user.email).toBe('operador@gopark.co');
    });
  });

  it('logout borra la cookie', async () => {
    const res = await request(app.getHttpServer()).post('/auth/logout').set('Cookie', operatorCookie).expect(204);
    expect((res.headers['set-cookie'] as unknown as string[])[0]).toMatch(/gopark_token=;/);
  });
});
