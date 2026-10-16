import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

const entrada = {
  nombre: z.string(),
  telefono: z.string().optional(),
  activo: z.boolean().optional(),
};

const soloLectura = { readOnlyHint: true, destructiveHint: false };
const escritura = { readOnlyHint: false, destructiveHint: false };
const borrado = { readOnlyHint: false, destructiveHint: true };

export function registrarServidores(servidor: McpServer) {
  servidor.registerTool(
    "listar_servidores",
    {
      description: "GET /api/servidores.",
      inputSchema: {},
      annotations: soloLectura,
    },
    async () =>
      textoMcp(await llamarApi({ metodo: "GET", ruta: "/api/servidores" })),
  );

  servidor.registerTool(
    "crear_servidor",
    {
      description: "POST /api/servidores.",
      inputSchema: entrada,
      annotations: escritura,
    },
    async (cuerpo) =>
      textoMcp(
        await llamarApi({ metodo: "POST", ruta: "/api/servidores", cuerpo }),
      ),
  );

  servidor.registerTool(
    "obtener_servidor",
    {
      description: "GET /api/servidores/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: soloLectura,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: `/api/servidores/${encodeURIComponent(id)}`,
        }),
      ),
  );

  servidor.registerTool(
    "actualizar_servidor",
    {
      description: "PATCH /api/servidores/{id}.",
      inputSchema: { id: z.string().min(1), ...entrada },
      annotations: escritura,
    },
    async ({ id, ...cuerpo }) =>
      textoMcp(
        await llamarApi({
          metodo: "PATCH",
          ruta: `/api/servidores/${encodeURIComponent(id)}`,
          cuerpo,
        }),
      ),
  );

  servidor.registerTool(
    "borrar_servidor",
    {
      description: "DELETE /api/servidores/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: borrado,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "DELETE",
          ruta: `/api/servidores/${encodeURIComponent(id)}`,
        }),
      ),
  );
}
