import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

const mes = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .optional();

const soloLectura = { readOnlyHint: true, destructiveHint: false };

export function registrarDesempeno(servidor: McpServer) {
  servidor.registerTool(
    "listar_desempeno",
    {
      description: "GET /api/desempeno. Mes YYYY-MM opcional.",
      inputSchema: { mes },
      annotations: soloLectura,
    },
    async ({ mes: mesConsulta }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: "/api/desempeno",
          consulta: { mes: mesConsulta },
        }),
      ),
  );

  servidor.registerTool(
    "obtener_desempeno_barbero",
    {
      description: "GET /api/desempeno/{barberoId}.",
      inputSchema: { barberoId: z.string().min(1), mes },
      annotations: soloLectura,
    },
    async ({ barberoId, mes: mesConsulta }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: `/api/desempeno/${encodeURIComponent(barberoId)}`,
          consulta: { mes: mesConsulta },
        }),
      ),
  );
}
