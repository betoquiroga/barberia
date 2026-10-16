import type { Servidor } from "@/types/servidor";

type NombresServidoresProps = {
  servidores: Servidor[];
};

export function NombresServidores({ servidores }: NombresServidoresProps) {
  if (servidores.length === 0) {
    return <p className="text-zinc-400">Sin servidores</p>;
  }

  return (
    <p className="text-zinc-400">
      {servidores.map((servidor) => servidor.nombre).join(", ")}
    </p>
  );
}
