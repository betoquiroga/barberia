import { useEffect, useState } from "react";

export function useTypewriter(text: string): string {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (media.matches) {
      setVisible(text);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 70);

    return () => {
      clearInterval(interval);
    };
  }, [text]);

  return visible;
}
