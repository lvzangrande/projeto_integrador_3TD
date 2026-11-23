import Link from "next/link";
import { ClientePage } from "../_components/ClientePage";

export default function EconomiaCliente() {
  return (
    <ClientePage title="Painel de economia" description="Indicadores de eficiência hídrica e financeira, com transparência sobre os dados disponíveis.">
      <section className="cliente-notice cliente-notice--destaque">
        <span className="cliente-notice__icone" aria-hidden="true">i</span>
        <div><h2>Não há base confiável para calcular economia ainda</h2><p>O esquema atual registra leituras e ocorrências, mas não contém tarifa de água, custo financeiro, unidade padronizada para os volumes nem período de referência (baseline). Exibir um valor de economia sem esses dados seria impreciso.</p></div>
      </section>
      <section className="cliente-card">
        <h2>O que pode ser consultado agora</h2>
        <ul className="cliente-lista-check">
          <li>Histórico das leituras cadastradas, com origem e data.</li>
          <li>Ocorrências e volumes perdidos conforme registrados no sistema.</li>
          <li>Dados exportáveis para análise externa, sem conversões de unidade assumidas.</li>
        </ul>
        <div className="cliente-acoes-inline"><Link className="cliente-botao" href="/cliente/leituras">Consultar leituras</Link><Link className="cliente-botao cliente-botao--secundario" href="/cliente/relatorios">Abrir relatórios</Link></div>
      </section>
    </ClientePage>
  );
}
