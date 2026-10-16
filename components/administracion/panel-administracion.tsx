"use client";

import { PanelBarberos } from "@/components/administracion/panel-barberos";
import { PanelPrecios } from "@/components/administracion/panel-precios";

export function PanelAdministracion() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Administración</h1>
      <PanelBarberos />
      <PanelPrecios />
    </>
  );
}
