import { claseTextoSuave } from "@/lib/ui/clases";
import type { Servidor } from "@/types/servidor";

type NombresServidoresProps = {
  servidores: Servidor[];
};

export function NombresServidores({ servidores }: NombresServidoresProps) {
  if (servidores.length === 0) {
    return <p className={claseTextoSuave}>Sin servidores</p>;
  }

  return (
    <p className={claseTextoSuave}>
      {servidores.map((servidor) => servidor.nombre).join(", ")}
    </p>
  );
}
