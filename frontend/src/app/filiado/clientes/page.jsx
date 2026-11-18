"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function ClientesFiliado() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiRequest("/usuario")
      .then((usuarios) => setClientes((Array.isArray(usuarios) ? usuarios : []).filter((usuario) => usuario.categoria === "Cliente" && usuario.status === "Ativo")))
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 24 }}>
      <Link href="/filiado">← Voltar ao painel</Link>
      <h1 style={{ margin: "24px 0 8px" }}>Meus clientes</h1>
      <p>Lista de clientes ativos disponíveis no sistema. A API ainda não filtra os clientes por Filiado.</p>
      {carregando && <p role="status">Carregando clientes…</p>}
      {erro && <p role="alert">Não foi possível carregar os clientes: {erro}</p>}
      {!carregando && !erro && clientes.length === 0 && <p>Nenhum cliente ativo encontrado.</p>}
      {!erro && clientes.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead><tr>{["Nome", "E-mail", "Documento", "Telefone", "Status"].map((coluna) => <th key={coluna} style={{ padding: 12, borderBottom: "1px solid #8A94A6" }}>{coluna}</th>)}</tr></thead>
            <tbody>{clientes.map((cliente) => <tr key={cliente.id_usuario}>
              {[cliente.nome, cliente.email, cliente.cnpj, cliente.telefone || "—", cliente.status].map((valor, i) => <td key={i} style={{ padding: 12, borderBottom: "1px solid #D6ECF3" }}>{valor}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}
