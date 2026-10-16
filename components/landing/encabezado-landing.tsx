import { claseBotonPrincipal } from "@/lib/ui/clases";

export function EncabezadoLanding() {
  return (
    <header className="border-b border-borde">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="font-medium">Barbería</p>
        <nav className="flex gap-4 text-sm text-suave">
          <a className="hover:text-acento" href="#servicios">
            Servicios
          </a>
          <a className="hover:text-acento" href="#horario">
            Horario
          </a>
          <a className={`${claseBotonPrincipal} inline-block`} href="#reserva">
            Reservar
          </a>
        </nav>
      </div>
    </header>
  );
}
