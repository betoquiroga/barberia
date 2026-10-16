# Validación backend: servidor MCP

Plan: `planifications/mcp-server-api.md`

## Migraciones

- Puntaje: **10**
- Veredicto: **aprobado**

El plan declara que no hay migración y prohíbe archivos nuevos o editados en `supabase/migrations/`. Este trabajo no añade SQL. Las migraciones que ya existen en el repo pertenecen a módulos anteriores (`clientes`, `horarios`, `servidores`, `citas`, `pagos`, `desempeño`) y el MCP no las lee ni las escribe.

## Lógica de negocio y transporte

- Puntaje: **9**
- Veredicto: **aprobado**

Evidencia:

- `package.json` declara `"mcp": "node --experimental-strip-types mcp/servidor.ts"` y las dependencias `@modelcontextprotocol/sdk` y `zod`.
- `mcp/servidor.ts` crea `McpServer` con `name: "barberia"` y `version` de `package.json`, registra los diez módulos y conecta `StdioServerTransport`. El log va a stderr.
- Hay 27 `registerTool` y ninguna herramienta de webhook: citas (2), catálogo (1), pagos (1), clientes (5), servidores (5), servicios ofrecidos (5), horarios (5), desempeño (2), conexión (1).
- `types/mcp-respuesta.ts` define el sobre `{ ok: true, status, cuerpo }` o `{ ok: false, error: "api_inalcanzable", detalle }`.
- `mcp/cliente-api.ts` es el único `fetch`: base `BARBERIA_API_URL` o `http://127.0.0.1:3000` sin barra final, ruta que empieza por `/api/`, omite query `undefined`, `Content-Type` solo con cuerpo, timeout de 10 s, JSON objeto reenviado con `isError` si el status es >= 400, y fallos de red o JSON inválido como `api_inalcanzable`. No envía cabeceras secretas.
- Anotaciones: GET `readOnlyHint: true`; POST/PATCH `destructiveHint: false`; DELETE `destructiveHint: true`.
- Los inputs coinciden con el plan (`servicioId`, `precio_pesos`, `barberoId`, unión de horario abierto/cerrado, mes `YYYY-MM` opcional).
- Ningún archivo bajo `mcp/` importa `@/lib` ni `@supabase/supabase-js`.

No baja de 7: un JSON 2xx que no sea objeto se trata como `api_inalcanzable`. Las rutas del plan responden objetos, así que no cambia el contrato esperado.
