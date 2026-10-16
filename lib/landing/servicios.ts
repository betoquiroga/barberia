import type { Servicio } from "@/types/servicio";

export const serviciosLanding: Servicio[] = [
  {
    id: "corte-clasico",
    nombre: "Corte clásico",
    descripcion: "Corte de cabello con tijera o máquina.",
    precio: 18000,
  },
  {
    id: "arreglo-barba",
    nombre: "Arreglo de barba",
    descripcion: "Perfilado y arreglo de barba.",
    precio: 12000,
  },
  {
    id: "corte-y-barba",
    nombre: "Corte y barba",
    descripcion: "Corte de cabello y arreglo de barba en la misma visita.",
    precio: 28000,
  },
];
