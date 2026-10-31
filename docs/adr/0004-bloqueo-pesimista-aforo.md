# ADR 0004: Bloqueo pesimista para el control de aforo

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark (Product Owner: Dilan García)

## Contexto
Dos operadores pueden intentar ocupar el último cupo disponible al mismo tiempo.

## Decisión
Transacción con `SELECT ... FOR UPDATE` sobre el registro de capacidad del tipo de vehículo antes de crear la sesión.

## Alternativas consideradas
Bloqueo optimista (reintentos) y aislamiento SERIALIZABLE: viables, pero más complejos de manejar en la interfaz del cajero.

## Consecuencias
Uno de los dos ingresos simultáneos se rechaza limpiamente. Se valida con una prueba de concurrencia automatizada.
