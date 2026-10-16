import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { llamarApi, textoMcp } from "../cliente-api.ts";

const mes = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .optional();

const entradaCita = {
  nombre: z.string(),
  correo: z.string(),
  telefono: z.string(),
  servicioId: z.string(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  nota: z.string(),
};

const soloLectura = { readOnlyHint: true, destructiveHint: false };
const escritura = { readOnlyHint: false, destructiveHint: false };

export function registrarCitas(servidor: McpServer) {
  servidor.registerTool(
    "leer_diagrama_citas",
    {
      description: "GET /api/citas. Mes YYYY-MM opcional.",
      inputSchema: { mes },
      annotations: soloLectura,
    },
    async ({ mes: mesConsulta }) =>
      textoMcp(
        await llamarApi({
          metodo: "GET",
          ruta: "/api/citas",
          consulta: { mes: mesConsulta },
        }),
      ),
  );

  servidor.registerTool(
    "crear_cita",
    {
      description: "POST /api/citas.",
      inputSchema: entradaCita,
      annotations: escritura,
    },
    async (cuerpo) =>
      textoMcp(
        await llamarApi({ metodo: "POST", ruta: "/api/citas", cuerpo }),
      ),
  );
}
