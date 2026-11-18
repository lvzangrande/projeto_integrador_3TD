"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const campo = { display: "grid", gap: 8, marginBottom: 16 };
const entrada = { padding: 12, border: "1px solid #8A94A6", borderRadius: 8, font: "inherit" };

export default function CadastrarCliente() {
  const [formulario, setFormulario] = useState({ nome: "", email: "", cnpj: "", telefone: "", senha: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  function alterar(evento) {
    setFormulario((atual) => ({ ...atual, [evento.target.name]: evento.target.value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setSucesso("");
    setEnviando(true);
    try {
      await apiRequest("/usuario", {
        method: "POST",
        body: JSON.stringify({ ...formulario, categoria: "Cliente", tema: "Escuro", status: "Ativo" }),
      });
      setSucesso("Cliente cadastrado. Ele já aparece na lista de clientes e pode ser vinculado a uma reunião.");
      setFormulario({ nome: "", email: "", cnpj: "", telefone: "", senha: "" });
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 24 }}>
      <Link href="/filiado">← Voltar ao painel</Link>
      <h1 style={{ margin: "24px 0 8px" }}>Cadastrar cliente</h1>
      <p style={{ marginBottom: 24 }}>Os campos são salvos no cadastro de usuários da API.</p>
      <form onSubmit={enviar}>
        <label style={campo}>Nome completo ou razão social<input name="nome" value={formulario.nome} onChange={alterar} maxLength={100} required style={entrada} /></label>
        <label style={campo}>E-mail<input name="email" type="email" value={formulario.email} onChange={alterar} maxLength={100} required style={entrada} /></label>
        <label style={campo}>CPF/CNPJ<input name="cnpj" value={formulario.cnpj} onChange={alterar} maxLength={20} required style={entrada} /></label>
        <label style={campo}>Telefone<input name="telefone" type="tel" value={formulario.telefone} onChange={alterar} maxLength={20} style={entrada} /></label>
        <label style={campo}>Senha inicial<input name="senha" type="password" value={formulario.senha} onChange={alterar} minLength={8} required autoComplete="new-password" style={entrada} /></label>
        {erro && <p role="alert" style={{ marginBottom: 16 }}>{erro}</p>}
        {sucesso && <p role="status" style={{ marginBottom: 16 }}>{sucesso} <Link href="/filiado/clientes">Ver clientes</Link></p>}
        <button type="submit" disabled={enviando} style={{ ...entrada, cursor: "pointer", background: "#1D6FA5", color: "white", border: 0 }}>
          {enviando ? "Salvando…" : "Cadastrar cliente"}
        </button>
      </form>
    </main>
  );
}
