export type RespuestaMcp =
  | { ok: true; status: number; cuerpo: unknown }
  | { ok: false; error: "api_inalcanzable"; detalle: string };
