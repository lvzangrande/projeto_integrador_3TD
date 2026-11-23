"use client";

import { useMemo, useState } from "react";
import { ClientePage, ClienteStatus, formatarData, formatarNumero, useClientePortal } from "../_components/ClientePage";

export default function LeiturasCliente() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [idReservatorio, setIdReservatorio] = useState("");
  const [idSetor, setIdSetor] = useState("");
  const [idMedidor, setIdMedidor] = useState("");
  const [filtro, setFiltro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const { data: estrutura, loading: carregandoEstrutura, error: erroEstrutura } = useClientePortal("/cliente/portal/estrutura");
  const path = useMemo(() => `/cliente/portal/leituras${filtro ? `?${filtro}` : ""}`, [filtro]);
  const { data, loading, error } = useClientePortal(path);
  const reservatorios = estrutura || [];
  const setores = reservatorios.flatMap((reservatorio) => reservatorio.setores.map((setor) => ({ ...setor, id_reservatorio: reservatorio.id_reservatorio })));
  const medidores = setores.flatMap((setor) => (setor.medidores || []).map((medidor) => ({ ...medidor, id_setor: setor.id_setor, nome_setor: setor.nome, id_reservatorio: setor.id_reservatorio })));
  const setoresVisiveis = idReservatorio ? setores.filter((setor) => String(setor.id_reservatorio) === idReservatorio) : setores;
  const medidoresVisiveis = idSetor ? medidores.filter((medidor) => String(medidor.id_setor) === idSetor) : idReservatorio ? medidores.filter((medidor) => String(medidor.id_reservatorio) === idReservatorio) : medidores;

  function aplicarFiltro(event) {
    event.preventDefault();
    if (inicio && fim && inicio > fim) {
      setMensagem("A data inicial deve ser anterior ou igual à data final.");
      return;
    }
    setMensagem("");
    const query = new URLSearchParams();
    if (inicio) query.set("inicio", inicio);
    if (fim) query.set("fim", fim);
    if (idReservatorio) query.set("id_reservatorio", idReservatorio);
    if (idSetor) query.set("id_setor", idSetor);
    if (idMedidor) query.set("id_medidor", idMedidor);
    setFiltro(query.toString());
  }

  function limpar() {
    setInicio("");
    setFim("");
    setIdReservatorio("");
    setIdSetor("");
    setIdMedidor("");
    setMensagem("");
    setFiltro("");
  }

  return (
    <ClientePage title="Leituras e medidores" description="Filtre o histórico por período, reservatório, setor ou medidor.">
      {erroEstrutura && <p className="cliente-inline-erro" role="alert">Não foi possível carregar as opções de estrutura para os filtros.</p>}
      <form className="cliente-filtros" onSubmit={aplicarFiltro}>
        <label>De<input type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} /></label>
        <label>Até<input type="date" value={fim} onChange={(event) => setFim(event.target.value)} /></label>
        <label>Reservatório<select value={idReservatorio} disabled={carregandoEstrutura} onChange={(event) => { setIdReservatorio(event.target.value); setIdSetor(""); setIdMedidor(""); }}><option value="">Todos</option>{reservatorios.map((item) => <option key={item.id_reservatorio} value={item.id_reservatorio}>{item.nome}</option>)}</select></label>
        <label>Setor<select value={idSetor} disabled={carregandoEstrutura} onChange={(event) => { setIdSetor(event.target.value); setIdMedidor(""); }}><option value="">Todos</option>{setoresVisiveis.map((item) => <option key={item.id_setor} value={item.id_setor}>{item.nome}</option>)}</select></label>
        <label>Medidor<select value={idMedidor} disabled={carregandoEstrutura} onChange={(event) => setIdMedidor(event.target.value)}><option value="">Todos</option>{medidoresVisiveis.map((item) => <option key={item.id_medidor} value={item.id_medidor}>{item.numero_serie} · {item.tipo}</option>)}</select></label>
        <div className="cliente-filtros__acoes"><button type="submit" className="cliente-botao">Aplicar filtros</button><button type="button" className="cliente-botao cliente-botao--secundario" onClick={limpar}>Limpar</button></div>
      </form>
      {mensagem && <p className="cliente-inline-erro" role="alert">{mensagem}</p>}
      <ClienteStatus loading={loading} error={error} empty={data?.length === 0 ? "Nenhuma leitura encontrada para os filtros selecionados." : ""}>
        <div className="cliente-tabela-wrap"><table className="cliente-tabela">
          <thead><tr><th>Data e hora</th><th>Reservatório</th><th>Setor</th><th>Medidor</th><th>Tipo</th><th>Leitura</th><th>Origem</th></tr></thead>
          <tbody>{data?.map((leitura) => <tr key={leitura.id_leitura}>
            <td>{formatarData(leitura.momento_leitura)}</td><td>{leitura.reservatorio}</td><td>{leitura.setor}</td>
            <td>{leitura.medidor}</td><td>{leitura.tipo_medidor}</td><td>{formatarNumero(leitura.volume_leitura)}</td><td>{leitura.origem}</td>
          </tr>)}</tbody>
        </table></div>
        {data?.length === 500 && <p className="cliente-muted">Exibindo até 500 registros mais recentes; refine os filtros para consultar um intervalo menor.</p>}
      </ClienteStatus>
    </ClientePage>
  );
}
