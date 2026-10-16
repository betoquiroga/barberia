export function EncabezadoLanding() {
  return (
    <header className="border-b border-zinc-800">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="font-medium">Barbería</p>
        <nav className="flex gap-4 text-sm text-zinc-300">
          <a className="hover:text-zinc-50" href="#servicios">
            Servicios
          </a>
          <a className="hover:text-zinc-50" href="#horario">
            Horario
          </a>
          <a className="hover:text-zinc-50" href="#reserva">
            Reservar
          </a>
        </nav>
      </div>
    </header>
  );
}
