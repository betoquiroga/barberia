import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

const entrada = {
  nombre: z.string(),
  correo: z.string(),
  telefono: z.string(),
  detalle: z.string().optional(),
};

const soloLectura = { readOnlyHint: true, destructiveHint: false };
const escritura = { readOnlyHint: false, destructiveHint: false };
const borrado = { readOnlyHint: false, destructiveHint: true };

export function registrarClientes(servidor: McpServer) {
  servidor.registerTool(
    "listar_clientes",
    {
      description: "GET /api/clientes.",
      inputSchema: {},
      annotations: soloLectura,
    },
    async () =>
      textoMcp(await llamarApi({ metodo: "GET", ruta: "/api/clientes" })),
  );

  servidor.registerTool(
    "crear_cliente",
    {
      description: "POST /api/clientes.",
      inputSchema: entrada,
      annotations: escritura,
    },
    async (cuerpo) =>
      textoMcp(
        await llamarApi({ metodo: "POST", ruta: "/api/clientes", cuerpo }),
      ),
  );

  servidor.registerTool(
    "obtener_cliente",
    {
      description: "GET /api/clientes/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: soloLectura,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: `/api/clientes/${encodeURIComponent(id)}`,
        }),
      ),
  );

  servidor.registerTool(
    "actualizar_cliente",
    {
      description: "PATCH /api/clientes/{id}.",
      inputSchema: { id: z.string().min(1), ...entrada },
      annotations: escritura,
    },
    async ({ id, ...cuerpo }) =>
      textoMcp(
        await llamarApi({
          metodo: "PATCH",
          ruta: `/api/clientes/${encodeURIComponent(id)}`,
          cuerpo,
        }),
      ),
  );

  servidor.registerTool(
    "borrar_cliente",
    {
      description: "DELETE /api/clientes/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: borrado,
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "DELETE",
          ruta: `/api/clientes/${encodeURIComponent(id)}`,
        }),
      ),
  );
}
