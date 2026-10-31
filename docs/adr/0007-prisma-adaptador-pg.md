# ADR 0007: Prisma con adaptador `pg` (cliente sin motor Rust)

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark

## Contexto
Por defecto Prisma ejecuta las consultas con un motor binario (Rust) que se descarga al instalar. Eso agranda las imágenes Docker y depende de la plataforma (glibc/musl, openssl).

## Decisión
Usar `engineType = "client"` en el generador y conectar con `@prisma/adapter-pg` (driver `pg` de Node). Ver `apps/api/src/prisma/prisma.service.ts`.

## Alternativas consideradas
Motor binario por defecto: funciona, pero añade un binario por plataforma y más peso en el despliegue.

## Consecuencias
- En tiempo de ejecución solo se necesita Node.js y el driver `pg`.
- El CLI de Prisma (`migrate`, `db seed`) sigue usando su motor de esquemas, que se descarga en el equipo del desarrollador, en el CI y en la imagen Docker.
