import { mensajeErrorCatalogo } from "@/lib/servicios/mensajes-error-catalogo";
import { claseError, claseTextoSuave } from "@/lib/ui/clases";

type MensajeCatalogoProps = {
  fase: "carga" | "error";
};

export function MensajeCatalogo({ fase }: MensajeCatalogoProps) {
  if (fase === "carga") {
    return <p className={claseTextoSuave}>Cargando estilos…</p>;
  }

  return (
    <p className={claseError}>{mensajeErrorCatalogo("supabase_inalcanzable")}</p>
  );
}
