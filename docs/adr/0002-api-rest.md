# ADR 0002: Estilo de API REST

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark (Product Owner: Dilan García)

## Contexto
El frontend necesita operar sobre recursos claros: turnos, sesiones de parqueo, tarifas y métricas.

## Decisión
API REST con JSON sobre HTTPS, documentada con OpenAPI/Swagger desde NestJS.

## Alternativas consideradas
GraphQL: descartado; el dominio no requiere consultas flexibles y REST es el estilo trabajado en el curso.

## Consecuencias
Endpoints como `POST /shifts/open`, `POST /sessions/check-in` y `POST /sessions/check-out`; códigos HTTP estándar.
