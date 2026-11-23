"use client";

import Link from "next/link";
import { ClientePage, ClienteStatus, formatarData, useClientePortal } from "../_components/ClientePage";

export default function AlertasCliente() {
  const { data, loading, error } = useClientePortal("/cliente/portal/ocorrencias?status=Aberta");
  return (
    <ClientePage title="Central de alertas" description="Acompanhe registros abertos que podem exigir atenção da sua operação.">
      <section className="cliente-notice">
        <span className="cliente-notice__icone" aria-hidden="true">i</span>
        <p>O banco atual não possui uma tabela de alertas nem regras de notificação. Esta página mostra apenas ocorrências com status “Aberta”; elas não representam alertas automáticos.</p>
      </section>
      <ClienteStatus loading={loading} error={error} empty={data?.length === 0 ? "Não há ocorrências abertas registradas para sua conta." : ""}>
        <section className="cliente-lista">
          {data?.map((item) => <article className="cliente-card cliente-alerta" key={item.id_oc}>
            <div className="cliente-card__topo"><div><p className="cliente-card__eyebrow">{item.severidade} · {item.tipo}</p><h2>{item.reservatorio}{item.setor ? ` / ${item.setor}` : ""}</h2></div><span className="cliente-tag cliente-tag--alerta">Aberta</span></div>
            <p className="cliente-ocorrencia__descricao">{item.descricao}</p>
            <p className="cliente-muted">Registrada em {formatarData(item.momento_abertura)}</p>
          </article>)}
        </section>
      </ClienteStatus>
      <Link className="cliente-link-acao" href="/cliente/ocorrencias">Abrir a lista completa de ocorrências <span aria-hidden="true">→</span></Link>
    </ClientePage>
  );
}
