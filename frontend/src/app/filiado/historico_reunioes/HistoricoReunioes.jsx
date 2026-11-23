"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RegistrosTable from "@/components/Tabelas/Registros/registrostable";
import { apiRequest } from "@/lib/api";

const POR_PAGINA = 5;
const normalizar = (valor) => String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export default function HistoricoReunioes() {
  const [todos, setTodos] = useState([]);
  const [consulta, setConsulta] = useState({ busca: "", tipo: null, pagina: 1 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    apiRequest("/reunioes")
      .then((dados) => { if (ativo) setTodos(Array.isArray(dados) ? dados : []); })
      .catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const filtrados = useMemo(() => todos.filter((item) => {
    const valores = [item.pauta, item.resumo, item.tipo, item.nome_usuario, item.id_usuario];
    const buscaOk = !consulta.busca || valores.some((valor) => normalizar(valor).includes(normalizar(consulta.busca)));
    const tipoOk = !consulta.tipo || normalizar(item.tipo) === consulta.tipo;
    return buscaOk && tipoOk;
  }), [todos, consulta]);

  const registros = filtrados.slice((consulta.pagina - 1) * POR_PAGINA, consulta.pagina * POR_PAGINA).map((item) => ({
    ...item,
    id: item.id_reuniao,
    cliente: item.nome_usuario || (item.id_usuario ? `Usuário #${item.id_usuario}` : "Não informado"),
    dataHora: item.momento_abertura,
  }));
  const onChange = useCallback((filtros) => setConsulta(filtros), []);

  return <RegistrosTable registros={registros} total={filtrados.length} porPagina={POR_PAGINA} carregando={carregando} erro={erro} onChange={onChange} />;
}
