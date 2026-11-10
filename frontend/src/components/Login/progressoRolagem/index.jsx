"use client";

import { useEffect } from "react";

export default function ProgressoRolagem() {
  useEffect(() => {
    let quadroPendente = null;

    const atualizarProgresso = () => {
      quadroPendente = null;
      const secaoInicio = document.getElementById("inicio");
      const alturaInicio = secaoInicio?.offsetHeight ?? window.innerHeight;
      const progressoInicio = Math.min(Math.max(window.scrollY / alturaInicio, 0), 1);

      document
        .querySelectorAll(".inicio__cabecalho, .inicio__conteudo, .inicio__ilustracao")
        .forEach((item) => {
          const direcao = item.classList.contains("inicio__ilustracao") ? 1 : -1;
          const opacidade = 1 - Math.min(Math.max((progressoInicio - 0.2) / 0.8, 0), 1);
          item.style.opacity = opacidade.toFixed(3);
          item.style.transform = `translateX(${progressoInicio * 160 * direcao}px)`;
        });

      document.querySelectorAll(".sobre__item-scroll").forEach((item) => {
        const limites = item.getBoundingClientRect();
        const percurso = window.innerHeight + limites.height;
        const progressoItem = Math.min(
          Math.max((window.innerHeight - limites.top) / percurso, 0),
          1,
        );
        const opacidade = 1 - Math.min(Math.max((progressoItem - 0.65) / 0.35, 0), 1);
        item.style.opacity = opacidade.toFixed(3);
        if (!item.classList.contains("sobre__card")) {
          item.style.transform = `translateX(${-progressoItem * 24}px)`;
        }
      });
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
