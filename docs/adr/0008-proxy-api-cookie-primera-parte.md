# ADR 0008: El frontend reenvía `/api` a la API (cookie de primera parte)

- **Estado:** Aceptada
- **Fecha:** 30/10/2026
- **Decisores:** Equipo GoPark

## Contexto
El JWT viaja en una cookie HttpOnly (ADR 0005). Si el navegador llamara directo a la API en otro dominio (Render), la cookie sería de terceros: los navegadores la bloquean cada vez más y el middleware de Next.js no podría leerla para proteger las rutas.

## Decisión
El navegador solo llama a `/api/*` en el dominio del frontend. Next.js lo reenvía a la API (`rewrites` en `apps/web/next.config.mjs`). El middleware de Next verifica el JWT con el mismo `JWT_SECRET` para redirigir según el rol, y la API vuelve a validar el token y el rol en cada endpoint.

## Alternativas consideradas
- Llamadas directas con CORS y `SameSite=None`: cookie de terceros y más configuración.
- Token en `localStorage`: expuesto a XSS (descartado en ADR 0005).

## Consecuencias
- La cookie es de primera parte con `SameSite=Lax`.
- `JWT_SECRET` debe ser igual en `apps/api` y en `apps/web`.
- `API_URL` se fija al compilar el frontend.
