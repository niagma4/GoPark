# ADR 0005: JWT en cookie HttpOnly

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark (Product Owner: Dilan García)

## Contexto
El sistema maneja dinero y debe proteger la sesión del operador frente a ataques XSS.

## Decisión
JWT firmado almacenado en cookie HttpOnly, Secure y SameSite; roles ADMIN y OPERATOR verificados con guards de NestJS.

## Alternativas consideradas
localStorage: descartado porque el token queda expuesto a scripts (OWASP Foundation, s.f.).

## Consecuencias
La API se mantiene sin estado; el frontend no tiene acceso directo al token.
