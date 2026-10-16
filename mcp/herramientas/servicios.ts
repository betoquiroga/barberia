import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { llamarApi, textoMcp } from "../cliente-api.ts";

export function registrarCatalogoServicios(servidor: McpServer) {
  servidor.registerTool(
    "listar_catalogo_servicios",
    {
      description: "GET /api/servicios. Catálogo público de estilos.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async () =>
      textoMcp(await llamarApi({ metodo: "GET", ruta: "/api/servicios" })),
  );
}
