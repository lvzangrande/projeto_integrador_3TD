"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const estilo = { display: "grid", gap: 8, marginBottom: 16 };
const campo = { padding: 12, border: "1px solid #8A94A6", borderRadius: 8, font: "inherit" };

export default function RegistrarReuniao() {
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState({ id_usuario: "", tipo: "Reunião", pauta: "", resumo: "", proximos_passos: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregandoClientes, setCarregandoClientes] = useState(true);

  useEffect(() => {
    apiRequest("/usuario")
      .then((usuarios) => setClientes((Array.isArray(usuarios) ? usuarios : []).filter((usuario) => usuario.categoria === "Cliente" && usuario.status === "Ativo")))
      .catch((error) => setErro(`Não foi possível carregar os clientes: ${error.message}`))
      .finally(() => setCarregandoClientes(false));
  }, []);

  function alterar(evento) {
    setFormulario((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setSucesso("");
    setEnviando(true);
    try {
      await apiRequest("/reunioes", { method: "POST", body: JSON.stringify({ ...formulario, id_usuario: Number(formulario.id_usuario) }) });
      setSucesso("Registro salvo com sucesso.");
      setFormulario({ id_usuario: "", tipo: "Reunião", pauta: "", resumo: "", proximos_passos: "" });
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 24 }}>
      <Link href="/filiado">← Voltar ao painel</Link>
      <h1 style={{ margin: "24px 0 8px" }}>Registrar reunião ou entrevista</h1>
      <p style={{ marginBottom: 24 }}>O registro ficará disponível no histórico de reuniões.</p>
      <p style={{ marginBottom: 16 }}>A lista inclui os clientes disponíveis na API; o backend ainda não separa clientes por Filiado.</p>
      <form onSubmit={enviar}>
        <label style={estilo}>Cliente
          <select name="id_usuario" value={formulario.id_usuario} onChange={alterar} required style={campo}>
            <option value="">{carregandoClientes ? "Carregando clientes…" : "Selecione um cliente"}</option>
            {clientes.map((cliente) => <option key={cliente.id_usuario} value={cliente.id_usuario}>{cliente.nome}</option>)}
          </select>
        </label>
        {!carregandoClientes && !erro && clientes.length === 0 && <p role="status" style={{ marginBottom: 16 }}>Não há clientes ativos para selecionar.</p>}
        <label style={estilo}>Tipo
          <select name="tipo" value={formulario.tipo} onChange={alterar} style={campo}><option>Reunião</option><option>Entrevista</option></select>
        </label>
        <label style={estilo}>Pauta<input name="pauta" value={formulario.pauta} onChange={alterar} maxLength={255} required style={campo} /></label>
        <label style={estilo}>Resumo<textarea name="resumo" value={formulario.resumo} onChange={alterar} required rows={4} style={campo} /></label>
        <label style={estilo}>Próximos passos<textarea name="proximos_passos" value={formulario.proximos_passos} onChange={alterar} rows={3} style={campo} /></label>
        {erro && <p role="alert" style={{ marginBottom: 16 }}>{erro}</p>}
        {sucesso && <p role="status" style={{ marginBottom: 16 }}>{sucesso} <Link href="/filiado/historico_reunioes">Ver histórico</Link></p>}
        <button type="submit" disabled={enviando || carregandoClientes || clientes.length === 0} style={{ ...campo, cursor: "pointer", background: "#1D6FA5", color: "white", border: 0 }}>
          {enviando ? "Salvando…" : "Salvar registro"}
        </button>
      </form>
    </main>
  );
}
