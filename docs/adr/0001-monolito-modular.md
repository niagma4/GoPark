# ADR 0001: Arquitectura de monolito modular

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark (Product Owner: Dilan García)

## Contexto
El equipo tiene tres personas y cuatro sprints de dos semanas. GoPark necesita módulos bien separados (autenticación, turnos, sesiones, tarifas, aforo, métricas) sin el costo operativo de varios servicios.

## Decisión
Monolito modular: un frontend Next.js y una única API NestJS organizada por módulos de dominio, con una base de datos PostgreSQL.

## Alternativas consideradas
Microservicios: descartados por la complejidad de despliegue, observabilidad y comunicación entre servicios para un equipo pequeño (Newman, 2021).

## Consecuencias
Un solo despliegue de backend. Los módulos se comunican por inyección de dependencias y podrían extraerse como servicios más adelante.
