type CasillaActivoProps = {
  activo: boolean;
  deshabilitado: boolean;
  onChange: (activo: boolean) => void;
};

export function CasillaActivo({
  activo,
  deshabilitado,
  onChange,
}: CasillaActivoProps) {
  return (
    <label className="flex items-center gap-2 text-sm" htmlFor="activo">
      <input
        id="activo"
        name="activo"
        type="checkbox"
        checked={activo}
        disabled={deshabilitado}
        onChange={(evento) => onChange(evento.target.checked)}
      />
      Activo
    </label>
  );
}
