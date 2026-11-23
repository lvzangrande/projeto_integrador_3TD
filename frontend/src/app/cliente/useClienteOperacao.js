"use client";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function useClienteOperacao() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const atualizar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await carregarOperacao(apiRequest));
    } catch (falha) {
      setErro(falha?.message || "Não foi possível carregar os dados da operação.");
    } finally {
      setCarregando(false);
    }
  }, []);
  useEffect(() => {
    let ativo = true;
    apiRequest("/cliente/operacao")
      .then((resposta) => {
        if (!ativo) return;
        setDados({
          reservatorios: Array.isArray(resposta.reservatorios) ? resposta.reservatorios : [],
          setores: Array.isArray(resposta.setores) ? resposta.setores : [],
          medidores: Array.isArray(resposta.medidores) ? resposta.medidores : [],
          responsaveis: Array.isArray(resposta.responsaveis) ? resposta.responsaveis : [],
          leituras: Array.isArray(resposta.leituras) ? resposta.leituras : [],
          ocorrencias: Array.isArray(resposta.ocorrencias) ? resposta.ocorrencias : [],
        });
      })
      .catch((falha) => { if (ativo) setErro(falha?.message || "Não foi possível carregar os dados da operação."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);
  return { dados, carregando, erro, atualizar };
}
