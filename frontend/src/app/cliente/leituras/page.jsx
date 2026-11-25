"use client";

import { useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { ClientePage, ClienteStatus, formatarData, formatarNumero, useClientePortal } from "../_components/ClientePage";

function agoraSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}T${valores.hour}:${valores.minute}`;
}

export default function LeiturasCliente() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [idReservatorio, setIdReservatorio] = useState("");
  const [idSetor, setIdSetor] = useState("");
  const [idMedidor, setIdMedidor] = useState("");
  const [filtro, setFiltro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const { data: estrutura, loading: carregandoEstrutura, error: erroEstrutura } = useClientePortal("/cliente/portal/estrutura");
  const path = useMemo(() => {
    const query = new URLSearchParams(filtro);
    query.set("_atualizacao", String(atualizacao));
    return `/cliente/portal/leituras?${query.toString()}`;
  }, [filtro, atualizacao]);
  const { data, loading, error } = useClientePortal(path);
  const reservatorios = estrutura || [];
  const setores = reservatorios.flatMap((reservatorio) => reservatorio.setores.map((setor) => ({
    ...setor,
    id_reservatorio: reservatorio.id_reservatorio,
    nome_reservatorio: reservatorio.nome,
    status_reservatorio: reservatorio.status,
  })));
  const medidores = setores.flatMap((setor) => (setor.medidores || []).map((medidor) => ({ ...medidor, id_setor: setor.id_setor, nome_setor: setor.nome, id_reservatorio: setor.id_reservatorio, nome_reservatorio: setor.nome_reservatorio, status_setor: setor.status, status_reservatorio: setor.status_reservatorio })));
  const medidoresAtivos = medidores.filter((medidor) => medidor.status === "Ativo" && medidor.status_setor === "Ativo" && medidor.status_reservatorio === "Ativo");
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
    <ClientePage title="Leituras e medidores" description="Registre uma leitura manual e consulte o histórico por período, reservatório, setor ou medidor.">
      {erroEstrutura && <p className="cliente-inline-erro" role="alert">Não foi possível carregar as opções de estrutura para os filtros.</p>}
      <div className="cliente-leituras__formularios">
        <FormularioLeituraManual
          tipo="Nível"
          titulo="Registrar leitura de nível"
          descricao="Informe o nível medido em um reservatório da sua operação."
          medidores={medidoresAtivos.filter((medidor) => medidor.tipo === "Nível")}
          carregando={carregandoEstrutura}
          aoRegistrar={() => setAtualizacao((valor) => valor + 1)}
        />
        <FormularioLeituraManual
          tipo="Consumo"
          titulo="Registrar leitura de consumo"
          descricao="Registre a medição de vazão ou hidrômetro do setor."
          medidores={medidoresAtivos.filter((medidor) => ["Vazão", "Hidrômetro"].includes(medidor.tipo))}
          carregando={carregandoEstrutura}
          aoRegistrar={() => setAtualizacao((valor) => valor + 1)}
        />
      </div>
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

function FormularioLeituraManual({ tipo, titulo, descricao, medidores, carregando, aoRegistrar }) {
  const [idMedidor, setIdMedidor] = useState("");
  const [volume, setVolume] = useState("");
  const [momento, setMomento] = useState(agoraSaoPaulo);
  const [enviando, setEnviando] = useState(false);
  const [retorno, setRetorno] = useState({ erro: "", sucesso: "" });
  const slug = tipo === "Nível" ? "nivel" : "consumo";
  const medidorSelecionado = medidores.find((medidor) => String(medidor.id_medidor) === idMedidor);
  const ajuda = medidorSelecionado?.tipo === "Hidrômetro"
    ? "O valor do hidrômetro é acumulado e não pode ser menor que a leitura anterior."
    : tipo === "Nível"
      ? "Informe o volume atual em litros; o nível percentual é calculado pela capacidade do reservatório."
      : "Informe o volume registrado em litros pelo medidor selecionado.";

  async function registrar(event) {
    event.preventDefault();
    setRetorno({ erro: "", sucesso: "" });
    setEnviando(true);
    try {
      await apiRequest("/cliente/portal/leituras", {
        method: "POST",
        body: JSON.stringify({
          id_med: Number(idMedidor),
          volume_leitura: volume,
          momento_leitura: momento,
        }),
      });
      setRetorno({ erro: "", sucesso: "Leitura manual registrada no histórico." });
      setVolume("");
      setMomento(agoraSaoPaulo());
      aoRegistrar();
    } catch (error) {
      setRetorno({ erro: error.message || "Não foi possível registrar a leitura.", sucesso: "" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id={`registrar-${slug}`} className="cliente-leitura-form" aria-labelledby={`registrar-${slug}-titulo`}>
      <div className="cliente-leitura-form__cabecalho">
        <div>
          <p className="cliente-card__eyebrow">ENTRADA MANUAL</p>
          <h2 id={`registrar-${slug}-titulo`}>{titulo}</h2>
        </div>
        <p>{descricao}</p>
      </div>
      <form onSubmit={registrar}>
        <div className="cliente-leitura-form__campos">
          <label>Medidor
            <select required value={idMedidor} onChange={(event) => setIdMedidor(event.target.value)} disabled={carregando || medidores.length === 0}>
              <option value="">Selecione um medidor ativo</option>
              {medidores.map((medidor) => <option key={medidor.id_medidor} value={medidor.id_medidor}>{medidor.nome_reservatorio} / {medidor.nome_setor} · {medidor.numero_serie} ({medidor.tipo})</option>)}
            </select>
          </label>
          <label>Valor da leitura (L)
            <input required type="number" min="0" max="999999999999.999" step="0.001" inputMode="decimal" value={volume} onChange={(event) => setVolume(event.target.value)} placeholder="Ex.: 1250" />
          </label>
          <label>Data e hora da leitura
            <input required type="datetime-local" max={agoraSaoPaulo()} value={momento} onChange={(event) => setMomento(event.target.value)} />
          </label>
        </div>
        {medidores.length === 0 && !carregando && <p className="cliente-muted">Não há medidor ativo deste tipo vinculado a um reservatório e setor ativos.</p>}
        <p className="cliente-leitura-form__ajuda">{ajuda}</p>
        {retorno.erro && <p className="cliente-inline-erro" role="alert">{retorno.erro}</p>}
        {retorno.sucesso && <p className="cliente-inline-sucesso" role="status">{retorno.sucesso}</p>}
        <button className="cliente-botao" type="submit" disabled={enviando || carregando || medidores.length === 0}>
          {enviando ? "Registrando…" : "Registrar leitura"}
        </button>
      </form>
    </section>
  );
}
