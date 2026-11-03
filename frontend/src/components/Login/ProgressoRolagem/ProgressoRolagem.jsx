"use client";

import { useEffect } from "react";

export default function ProgressoRolagem() {
  useEffect(() => {
    let quadroPendente = null;

    const atualizarProgresso = () => {
      quadroPendente = null;
      const secaoInicio = document.getElementById("inicio");
      const alturaReferencia = secaoInicio ? secaoInicio.offsetHeight : window.innerHeight;
      const progresso = Math.min(Math.max(window.scrollY / alturaReferencia, 0), 1);
      document.querySelector(".pagina")?.style.setProperty("--progresso-rolagem", progresso.toFixed(4));
    };

    const aoRolar = () => {
      if (quadroPendente === null) {
        quadroPendente = requestAnimationFrame(atualizarProgresso);
      }
    };

    atualizarProgresso();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);

    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadroPendente !== null) cancelAnimationFrame(quadroPendente);
    };
  }, []);

  return null;
}
