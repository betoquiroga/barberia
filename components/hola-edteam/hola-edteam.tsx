"use client";

import { useTypewriter } from "@/hooks/use-typewriter";
import type { TypewriterProps } from "@/types/typewriter";

export function HolaEdteam({ text }: TypewriterProps) {
  const visible = useTypewriter(text);

  return <p className="text-3xl font-medium tracking-tight">{visible}</p>;
}
