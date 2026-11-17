"use client";

import { useEffect } from "react";
import Lenis from "lenis";

function atualizarEfeitosDeRolagem() {
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
}

export default function RolagemLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.1,
      smoothWheel: true,
    });

    atualizarEfeitosDeRolagem();
    const removerListener = lenis.on("scroll", atualizarEfeitosDeRolagem);
    window.addEventListener("resize", atualizarEfeitosDeRolagem);

    return () => {
      removerListener();
      window.removeEventListener("resize", atualizarEfeitosDeRolagem);
      lenis.destroy();
    };
  }, []);

  return null;
}
