"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export function useClientePortal(path) {
  const [state, setState] = useState({ path: null, data: null, loading: true, error: "" });

  useEffect(() => {
    let active = true;
    apiRequest(path)
      .then((data) => {
        if (active) setState({ path, data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active) setState({ path, data: null, loading: false, error: error.message || "Não foi possível carregar os dados." });
      });
    return () => {
      active = false;
    };
  }, [path]);

  return state.path === path ? state : { data: null, loading: true, error: "" };
}

export function ClientePage({ title, description, eyebrow = "ÁREA DO CLIENTE", children }) {
  return (
    <main className="cliente-page">
      <Link className="cliente-voltar" href="/cliente">
        <span aria-hidden="true">←</span> Voltar ao painel
      </Link>
      <header className="cliente-page__header">
        <p className="cliente-home__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}

export function ClienteStatus({ loading, error, empty, children }) {
  if (loading) return <div className="cliente-status" role="status">Carregando informações da sua operação…</div>;
  if (error) return <div className="cliente-status cliente-status--erro" role="alert">{error}</div>;
  if (empty) return <div className="cliente-status">{empty}</div>;
  return children;
}

export function formatarData(value) {
  if (!value) return "Sem registro";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(date);
}

export function formatarNumero(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(number)
    : String(value);
}
