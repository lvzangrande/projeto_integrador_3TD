"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { formatarLitrosPoupados, normalizarLitrosPoupados } from "./contadorAguaPoupada.js";

export default function ContadorAguaPoupada() {
  const [litros, setLitros] = useState(undefined);

  useEffect(() => {
    let ativo = true;
    const atualizar = () => apiRequest("/indicadores/agua-poupada")
      .then((dados) => {
        if (ativo) setLitros(normalizarLitrosPoupados(dados));
      })
      .catch(() => { if (ativo) setLitros(null); });

    atualizar();
    const intervalo = window.setInterval(atualizar, 60_000);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  return (
    <span
      className={`inicio__dado-valor${litros === null ? " inicio__dado-valor--indisponivel" : ""}`}
      aria-live="polite"
      aria-atomic="true"
      title={litros === null
        ? "São necessárias duas leituras recentes de cada hidrômetro real e ativo e um limite diário configurado para o setor."
        : "Estimativa comparada aos limites diários cadastrados por setor."}
    >
      {litros === undefined ? "—" : formatarLitrosPoupados(litros)}
    </span>
  );
}
