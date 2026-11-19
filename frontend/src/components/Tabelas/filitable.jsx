"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import "./filitable.css";

const POR_PAGINA = 10;

function Icon({ children, size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

function dataHora(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function valorFormatado(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(numero)
    : String(valor ?? "—");
}

export default function Filitable() {
  const [leituras, setLeituras] = useState([]);
  const [medidores, setMedidores] = useState([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([apiRequest("/leituras"), apiRequest("/medidores")])
      .then(([listaLeituras, listaMedidores]) => {
        if (!ativo) return;
        setLeituras(Array.isArray(listaLeituras) ? listaLeituras : []);
        setMedidores(Array.isArray(listaMedidores) ? listaMedidores : []);
      })
      .catch((errorApi) => { if (ativo) setErro(errorApi.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const registros = useMemo(() => {
    const porId = new Map(medidores.map((medidor) => [Number(medidor.id_med), medidor]));
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return leituras
      .map((leitura) => {
        const medidor = porId.get(Number(leitura.id_med));
        return {
          ...leitura,
          nomeMedidor: medidor?.num_serie || `Medidor #${leitura.id_med ?? "—"}`,
          tipoMedidor: medidor?.tipo || "Não informado",
        };
      })
      .filter((leitura) => !termo || [leitura.nomeMedidor, leitura.tipoMedidor, leitura.origem, leitura.volume_leitura, leitura.momento_leitura]
        .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo)))
      .sort((a, b) => new Date(b.momento_leitura).getTime() - new Date(a.momento_leitura).getTime());
  }, [leituras, medidores, busca]);

  const totalPaginas = Math.max(1, Math.ceil(registros.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const itensPagina = registros.slice(inicio, inicio + POR_PAGINA);

  return (
    <main className="ft-page" style={{ maxWidth: 1500, margin: "0 auto", padding: "32px 20px" }}>
      <div className="ft-container">
        <header className="ft-header">
          <div className="ft-brand">
            <Icon size={48}><path d="M12 3C9 8 5 12 5 16a7 7 0 0 0 14 0c0-4-4-8-7-13z" /><path d="M9 17a3 3 0 0 0 3 3" /></Icon>
            <span className="ft-brand__divider" />
            <div>
              <h1 className="ft-title">Histórico de Leituras</h1>
              <p className="ft-subtitle">Registros retornados pela API e seus medidores</p>
            </div>
          </div>
          <div className="ft-tools">
            <label className="ft-search">
              <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
              <input
                type="search"
                placeholder="Buscar medidor, origem ou valor..."
                value={busca}
                onChange={(evento) => { setBusca(evento.target.value); setPagina(1); }}
                aria-label="Buscar leituras"
              />
            </label>
          </div>
        </header>

        <section className="ft-card" aria-busy={carregando}>
          <div className="ft-scroll">
            <table className="ft-table" style={{ minWidth: 760 }}>
              <thead><tr>
                <th><span className="ft-th"><Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4m8-4v4M3 10h18" /></Icon>Data e hora</span></th>
                <th>Medidor</th>
                <th>Tipo</th>
                <th>Valor da leitura</th>
                <th>Origem</th>
              </tr></thead>
              <tbody>
                {erro && <tr><td colSpan={5} className="ft-empty" role="alert">Não foi possível carregar as leituras: {erro}</td></tr>}
                {!erro && carregando && <tr><td colSpan={5} className="ft-empty" role="status">Carregando leituras…</td></tr>}
                {!erro && !carregando && itensPagina.length === 0 && <tr><td colSpan={5} className="ft-empty">Nenhuma leitura encontrada.</td></tr>}
                {!erro && itensPagina.map((leitura) => <tr key={leitura.id_leitura} className="ft-row">
                  <td>{dataHora(leitura.momento_leitura)}</td>
                  <td>{leitura.nomeMedidor}</td>
                  <td>{leitura.tipoMedidor}</td>
                  <td>{valorFormatado(leitura.volume_leitura)}</td>
                  <td>{leitura.origem || "—"}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          {!erro && !carregando && <footer className="ft-footer">
            <p className="ft-count">Mostrando {registros.length ? `${inicio + 1}–${inicio + itensPagina.length}` : 0} de {registros.length} registros</p>
            <nav className="ft-pager" aria-label="Paginação das leituras">
              <button type="button" className="ft-page-btn" onClick={() => setPagina((atual) => Math.max(1, atual - 1))} disabled={paginaAtual === 1} aria-label="Página anterior">‹</button>
              <span aria-live="polite">{paginaAtual} / {totalPaginas}</span>
              <button type="button" className="ft-page-btn" onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))} disabled={paginaAtual === totalPaginas} aria-label="Próxima página">›</button>
            </nav>
          </footer>}
        </section>
      </div>
    </main>
  );
}
