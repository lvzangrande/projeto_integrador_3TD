"use client";

import { useEffect } from "react";

export default function PonteiroParalaxe() {
  useEffect(() => {
    let quadroPendente = null;
    let posicao = { x: 0, y: 0 };

    const aplicar = () => {
      quadroPendente = null;
      const raiz = document.querySelector(".pagina")?.style;
      raiz.setProperty("--ponteiro-x", posicao.x.toFixed(3));
      raiz.setProperty("--ponteiro-y", posicao.y.toFixed(3));
    };

    const aoMoverPonteiro = (evento) => {
      posicao = {
        x: (evento.clientX / window.innerWidth) * 2 - 1,
        y: (evento.clientY / window.innerHeight) * 2 - 1,
      };
      if (quadroPendente === null) quadroPendente = requestAnimationFrame(aplicar);
    };

    window.addEventListener("pointermove", aoMoverPonteiro, { passive: true });
    return () => {
      window.removeEventListener("pointermove", aoMoverPonteiro);
      if (quadroPendente !== null) cancelAnimationFrame(quadroPendente);
    };
  }, []);

  return null;
}
