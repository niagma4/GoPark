# ADR 0003: Persistencia en PostgreSQL

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark (Product Owner: Dilan García)

## Contexto
El dominio es transaccional: cobros, arqueos de caja y reserva de cupos.

## Decisión
PostgreSQL con Prisma ORM y migraciones versionadas.

## Alternativas consideradas
MongoDB (NoSQL): descartado porque se requieren integridad referencial y transacciones ACID.

## Consecuencias
Esquema relacional (User, CashShift, VehicleType, ParkingSession, Payment). Base gestionada en Supabase para producción.
