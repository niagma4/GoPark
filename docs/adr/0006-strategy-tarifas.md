# ADR 0006: Patrón Strategy para el motor de tarifas

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark (Product Owner: Dilan García)

## Contexto
Cada tipo de vehículo tiene reglas distintas: minutos de gracia, fracción, hora completa y tarifa nocturna.

## Decisión
Una estrategia de cálculo por tipo de vehículo detrás de una interfaz común (Gamma et al., 1994).

## Alternativas consideradas
Condicionales dentro del servicio: descartados porque crecen con cada regla nueva y dificultan las pruebas.

## Consecuencias
Cada estrategia se prueba de forma aislada con Jest (casos borde: gracia, redondeo, cruce de medianoche).
