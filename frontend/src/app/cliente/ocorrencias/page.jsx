"use client";

import { useMemo, useState } from "react";
import { ClientePage, ClienteStatus, formatarData, formatarNumero, useClientePortal } from "../_components/ClientePage";

const statusDisponiveis = ["Aberta", "Em análise", "Em reparo", "Resolvida", "Descartada"];

export default function OcorrenciasCliente() {
  const [status, setStatus] = useState("");
  const path = useMemo(() => `/cliente/portal/ocorrencias${status ? `?status=${encodeURIComponent(status)}` : ""}`, [status]);
  const { data, loading, error } = useClientePortal(path);
  return (
    <ClientePage title="Ocorrências" description="Consulte ocorrências vinculadas aos reservatórios da sua conta e acompanhe o status registrado.">
      <div className="cliente-filtros cliente-filtros--simples">
        <label>Filtrar por status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option>{statusDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <ClienteStatus loading={loading} error={error} empty={data?.length === 0 ? "Nenhuma ocorrência encontrada para o filtro selecionado." : ""}>
        <section className="cliente-lista">
          {data?.map((ocorrencia) => <article className="cliente-card" key={ocorrencia.id_oc}>
            <div className="cliente-card__topo">
              <div><p className="cliente-card__eyebrow">{ocorrencia.tipo} · {ocorrencia.severidade}</p><h2>{ocorrencia.reservatorio}{ocorrencia.setor ? ` / ${ocorrencia.setor}` : ""}</h2></div>
              <span className={`cliente-tag ${ocorrencia.status === "Resolvida" ? "cliente-tag--ativo" : ""}`}>{ocorrencia.status}</span>
            </div>
            <p className="cliente-ocorrencia__descricao">{ocorrencia.descricao}</p>
            <dl className="cliente-detalhes cliente-detalhes--compacto">
              <div><dt>Abertura</dt><dd>{formatarData(ocorrencia.momento_abertura)}</dd></div>
              <div><dt>Volume perdido cadastrado</dt><dd>{formatarNumero(ocorrencia.volume_perdido)} <small>(unidade não informada no cadastro)</small></dd></div>
            </dl>
          </article>)}
        </section>
        {data?.length === 500 && <p className="cliente-muted">Exibindo até 500 ocorrências mais recentes.</p>}
      </ClienteStatus>
    </ClientePage>
  );
}
