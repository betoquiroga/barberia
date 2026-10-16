import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

export function registrarPagos(servidor: McpServer) {
  servidor.registerTool(
    "leer_pago",
    {
      description: "GET /api/pagos/{id}.",
      inputSchema: { id: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async ({ id }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: `/api/pagos/${encodeURIComponent(id)}`,
        }),
      ),
  );
}
