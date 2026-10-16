import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registrarCitas } from "./herramientas/citas.ts";
import { registrarClientes } from "./herramientas/clientes.ts";
import { registrarConexion } from "./herramientas/conexion.ts";
import { registrarDesempeno } from "./herramientas/desempeno.ts";
import { registrarHorarios } from "./herramientas/horarios.ts";
import { registrarPagos } from "./herramientas/pagos.ts";
import { registrarServiciosOfrecidos } from "./herramientas/servicios-ofrecidos.ts";
import { registrarServidores } from "./herramientas/servidores.ts";
import { registrarCatalogoServicios } from "./herramientas/servicios.ts";

const paquete = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

const servidor = new McpServer({
  name: "barberia",
  version: paquete.version,
});

registrarCitas(servidor);
registrarCatalogoServicios(servidor);
registrarPagos(servidor);
registrarClientes(servidor);
registrarServidores(servidor);
registrarServiciosOfrecidos(servidor);
registrarHorarios(servidor);
registrarDesempeno(servidor);
registrarConexion(servidor);

const transporte = new StdioServerTransport();
await servidor.connect(transporte);
console.error("servidor mcp barberia en stdio");
