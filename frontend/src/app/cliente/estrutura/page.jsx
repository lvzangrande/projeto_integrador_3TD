"use client";

import { ClientePage, ClienteStatus, formatarNumero, useClientePortal } from "../_components/ClientePage";

export default function EstruturaCliente() {
  const { data, loading, error } = useClientePortal("/cliente/portal/estrutura");
  return (
    <ClientePage title="Reservatórios e setores" description="Estrutura hídrica vinculada à sua conta, apresentada em modo de consulta.">
      <ClienteStatus loading={loading} error={error} empty={data?.length === 0 ? "Ainda não há reservatórios vinculados à sua conta." : ""}>
        <section className="cliente-lista">
          {data?.map((reservatorio) => (
            <article className="cliente-card" key={reservatorio.id_reservatorio}>
              <div className="cliente-card__topo">
                <div><p className="cliente-card__eyebrow">{reservatorio.tipo}</p><h2>{reservatorio.nome}</h2></div>
                <span className={`cliente-tag ${reservatorio.status === "Ativo" ? "cliente-tag--ativo" : ""}`}>{reservatorio.status}</span>
              </div>
              <dl className="cliente-detalhes">
                <div><dt>Localização</dt><dd>{reservatorio.localizacao || "Não informada"}</dd></div>
                <div><dt>Capacidade cadastrada</dt><dd>{formatarNumero(reservatorio.capacidade)} <small>(unidade não informada no cadastro)</small></dd></div>
                <div><dt>Limites configurados</dt><dd>{formatarNumero(reservatorio.nivel_min)} – {formatarNumero(reservatorio.nivel_max)} <small>(unidade não informada)</small></dd></div>
                <div><dt>Setores</dt><dd>{reservatorio.setores.length}</dd></div>
              </dl>
              <div className="cliente-setores">
                <h3>Setores vinculados</h3>
                {reservatorio.setores.length ? (
                  <ul>{reservatorio.setores.map((setor) => (
                    <li key={setor.id_setor}>
                      <span><strong>{setor.nome}</strong><small>{setor.tipo}</small></span>
                      <span className="cliente-setor__info">Consumo máximo cadastrado: {formatarNumero(setor.consumo_max_dia)} <small>(unidade não informada)</small></span>
                      <span className={`cliente-tag ${setor.status === "Ativo" ? "cliente-tag--ativo" : ""}`}>{setor.status}</span>
                      {setor.medidores?.length > 0 && <span className="cliente-setor__medidores"><strong>Medidores:</strong> {setor.medidores.map((medidor) => `${medidor.numero_serie} (${medidor.tipo})`).join(", ")}</span>}
                    </li>
                  ))}</ul>
                ) : <p className="cliente-muted">Nenhum setor cadastrado para este reservatório.</p>}
              </div>
            </article>
          ))}
        </section>
      </ClienteStatus>
    </ClientePage>
  );
}
