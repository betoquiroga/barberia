import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { llamarApi, textoMcp } from "../cliente-api.ts";

export function registrarConexion(servidor: McpServer) {
  servidor.registerTool(
    "comprobar_conexion_supabase",
    {
      description: "GET /api/supabase/conexion.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async () =>
      textoMcp(
        await llamarApi({ metodo: "GET", ruta: "/api/supabase/conexion" }),
      ),
  );
}
