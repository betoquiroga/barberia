import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

const dia = z.enum([
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
]);

const hora = z.string().regex(/^\d{2}:\d{2}$/);

const entrada = z.union([
  z.object({ dia, cerrado: z.literal(true) }),
  z.object({ dia, cerrado: z.literal(false), abre: hora, cierra: hora }),
]);

const soloLectura = { readOnlyHint: true, destructiveHint: false };
const escritura = { readOnlyHint: false, destructiveHint: false };
const borrado = { readOnlyHint: false, destructiveHint: true };

export function registrarHorarios(servidor: McpServer) {
  servidor.registerTool(
    "listar_horarios",
    {
      description: "GET /api/horarios.",
      inputSchema: {},
      annotations: soloLectura,
    },
    async () =>
      textoMcp(await llamarApi({ metodo: "GET", ruta: "/api/horarios" })),
  );

  servidor.registerTool(
    "crear_horario",
    {
      description: "POST /api/horarios.",
      inputSchema: entrada,
      annotations: escritura,
    },
    async (cuerpo) =>
      textoMcp(
        await llamarApi({ metodo: "POST", ruta: "/api/horarios", cuerpo }),
      ),
  );

  servidor.registerTool(
    "obtener_horario",
    {
      description: "GET /api/horarios/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: soloLectura,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: `/api/horarios/${encodeURIComponent(id)}`,
        }),
      ),
  );

  servidor.registerTool(
    "actualizar_horario",
    {
      description: "PATCH /api/horarios/{id}.",
      inputSchema: z.object({ id: z.string().min(1) }).and(entrada),
      annotations: escritura,
    },
    async ({ id, ...cuerpo }) =>
      textoMcp(
        await llamarApi({
          metodo: "PATCH",
          ruta: `/api/horarios/${encodeURIComponent(id)}`,
          cuerpo,
        }),
      ),
  );

  servidor.registerTool(
    "borrar_horario",
    {
      description: "DELETE /api/horarios/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: borrado,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "DELETE",
          ruta: `/api/horarios/${encodeURIComponent(id)}`,
        }),
      ),
  );
}
