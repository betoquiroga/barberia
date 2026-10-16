import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

const entrada = {
  nombre: z.string(),
  precio_pesos: z.number(),
  costo_pesos: z.number(),
  servidor_ids: z.array(z.string()).optional(),
};

const soloLectura = { readOnlyHint: true, destructiveHint: false };
const escritura = { readOnlyHint: false, destructiveHint: false };
const borrado = { readOnlyHint: false, destructiveHint: true };

export function registrarServiciosOfrecidos(servidor: McpServer) {
  servidor.registerTool(
    "listar_servicios_ofrecidos",
    {
      description: "GET /api/servicios-ofrecidos.",
      inputSchema: {},
      annotations: soloLectura,
    },
    async () =>
      textoMcp(
        await llamarApi({ metodo: "GET", ruta: "/api/servicios-ofrecidos" }),
      ),
  );

  servidor.registerTool(
    "crear_servicio_ofrecido",
    {
      description: "POST /api/servicios-ofrecidos.",
      inputSchema: entrada,
      annotations: escritura,
    },
    async (cuerpo) =>
      textoMcp(
        await llamarApi({
          metodo: "POST",
          ruta: "/api/servicios-ofrecidos",
          cuerpo,
        }),
      ),
  );

  servidor.registerTool(
    "obtener_servicio_ofrecido",
    {
      description: "GET /api/servicios-ofrecidos/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: soloLectura,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: `/api/servicios-ofrecidos/${encodeURIComponent(id)}`,
        }),
      ),
  );

  servidor.registerTool(
    "actualizar_servicio_ofrecido",
    {
      description: "PATCH /api/servicios-ofrecidos/{id}.",
      inputSchema: { id: z.string().min(1), ...entrada },
      annotations: escritura,
    },
    async ({ id, ...cuerpo }) =>
      textoMcp(
        await llamarApi({
          metodo: "PATCH",
          ruta: `/api/servicios-ofrecidos/${encodeURIComponent(id)}`,
          cuerpo,
        }),
      ),
  );

  servidor.registerTool(
    "borrar_servicio_ofrecido",
    {
      description: "DELETE /api/servicios-ofrecidos/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: borrado,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "DELETE",
          ruta: `/api/servicios-ofrecidos/${encodeURIComponent(id)}`,
        }),
      ),
  );
}
