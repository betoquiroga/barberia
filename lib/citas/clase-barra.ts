const ANCHOS = [
  "w-0",
  "w-1/12",
  "w-2/12",
  "w-3/12",
  "w-4/12",
  "w-5/12",
  "w-6/12",
  "w-7/12",
  "w-8/12",
  "w-9/12",
  "w-10/12",
  "w-11/12",
  "w-full",
] as const;

export function claseBarra(cantidad: number, maximo: number): string {
  if (cantidad <= 0 || maximo <= 0) {
    return ANCHOS[0];
  }

  if (cantidad >= maximo) {
    return ANCHOS[12];
  }

  const pasos = Math.round((cantidad / maximo) * 12);

  return ANCHOS[Math.min(11, Math.max(1, pasos))];
}
