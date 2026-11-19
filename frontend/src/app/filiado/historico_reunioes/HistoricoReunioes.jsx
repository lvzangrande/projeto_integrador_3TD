"use client";

import { useCallback, useEffect, useState } from "react";
import RegistrosTable from "@/components/Tabelas/Registros/registrostable";
import { apiRequest } from "@/lib/api";

const POR_PAGINA = 5;
export default function HistoricoReunioes() {
  const [todos, setTodos] = useState([]);
  const [pagina, setPagina] = useState(1);
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

  const registros = todos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map((item) => ({
    ...item,
    id: item.id_reuniao,
    cliente: item.nome_usuario || (item.id_usuario ? `Usuário #${item.id_usuario}` : "Não informado"),
    dataHora: item.momento_abertura,
  }));
  const onChange = useCallback(({ pagina: novaPagina }) => setPagina(novaPagina), []);

  return <RegistrosTable registros={registros} total={todos.length} porPagina={POR_PAGINA} carregando={carregando} erro={erro} onChange={onChange} />;
}
