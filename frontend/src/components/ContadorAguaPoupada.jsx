"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const formatador = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export default function ContadorAguaPoupada() {
  const [litros, setLitros] = useState(null);

  useEffect(() => {
    let ativo = true;
    const atualizar = () => apiRequest("/indicadores/agua-poupada")
      .then((dados) => {
        if (ativo && typeof dados.litros_por_dia === "number" && Number.isFinite(dados.litros_por_dia)) {
          setLitros(Math.max(0, dados.litros_por_dia));
        }
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
    <span className="inicio__dado-valor" aria-live="polite" aria-atomic="true">
      {litros === null ? "—" : `${formatador.format(litros)} L`}
    </span>
  );
}
