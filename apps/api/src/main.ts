import 'dotenv/config'; // carga apps/api/.env si existe (en producción las variables las da la plataforma)
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

function assertEnv(): void {
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
}

async function bootstrap() {
  assertEnv();
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const config = new DocumentBuilder()
    .setTitle('GoPark API')
    .setDescription('API REST de GoPark — Sprint 1: autenticación/roles (HU-01) y turnos de caja (HU-02)')
    .setVersion('0.1.0')
    .addCookieAuth('gopark_token')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`API en http://localhost:${port} · Swagger en http://localhost:${port}/docs`, 'GoPark');
}
void bootstrap();
