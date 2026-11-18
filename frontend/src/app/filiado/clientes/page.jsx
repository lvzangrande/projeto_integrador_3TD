"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import "./Meusclientes.css";

const iniciais = (nome = "") => nome.trim().split(/\s+/).map((parte) => parte[0]).slice(0, 2).join("").toUpperCase();

function formatarDataHora(valor) {
  if (!valor) return "Sem reunião";
  const data = new Date(String(valor).replace(" ", "T"));
  if (Number.isNaN(data.getTime())) return "Sem reunião";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function IconeBusca() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg>;
}

export default function MeusClientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    apiRequest("/usuario")
      .then((dados) => { if (ativo) setClientes(Array.isArray(dados) ? dados : []); })
      .catch((error) => { if (ativo) setErro(error.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return clientes;
    return clientes.filter((cliente) => [cliente.nome, cliente.email, cliente.documento]
      .some((valor) => String(valor ?? "").toLocaleLowerCase("pt-BR").includes(termo)));
  }, [clientes, busca]);

  return (
    <div className="mc">
      <div className="mc-voltar-wrap"><BotaoVoltar /></div>
      <main>
        <header className="mc-cabecalho">
          <div>
            <p className="mc-contexto">ÁREA DO AFILIADO</p>
            <h1>Meus Clientes</h1>
            <p className="subtitulo">Clientes cadastrados por você e vinculados à sua carteira.</p>
          </div>
          <Link className="mc-novo" href="/filiado/cadastrar_cliente">Cadastrar cliente</Link>
        </header>

        <div className="filtros">
          <label className="busca"><IconeBusca /><input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por nome, e-mail ou documento..." /></label>
        </div>

        <section className="cartao" aria-busy={carregando}>
          <div className="rolagem">
            <table>
              <thead><tr>{["Cliente", "E-mail", "Pessoa", "Última reunião", "Status"].map((titulo) => <th key={titulo}>{titulo}</th>)}</tr></thead>
              <tbody>
                {erro ? <tr><td className="mc-vazio" colSpan={5} role="alert">{erro}</td></tr> : null}
                {!erro && carregando ? <tr><td className="mc-vazio" colSpan={5}>Carregando clientes...</td></tr> : null}
                {!erro && !carregando && visiveis.map((cliente) => (
                  <tr key={cliente.id_usuario}>
                    <td><div className="cliente"><span className="avatar">{iniciais(cliente.nome)}</span>{cliente.nome}</div></td>
                    <td className="suave">{cliente.email}</td>
                    <td className="suave">{cliente.tipo_pessoa === "juridica" ? "Pessoa jurídica" : "Pessoa física"}</td>
                    <td className="num">{formatarDataHora(cliente.ultima_reuniao)}</td>
                    <td><span className={`status ${cliente.status === "Ativo" ? "ok" : "pendente"}`}><i />{cliente.status}</span></td>
                  </tr>
                ))}
                {!erro && !carregando && visiveis.length === 0 ? <tr><td className="mc-vazio" colSpan={5}>{busca ? "Nenhum cliente corresponde à busca." : "Nenhum cliente cadastrado na sua carteira."}</td></tr> : null}
              </tbody>
            </table>
          </div>
          <footer><span>{carregando ? "Carregando..." : `Exibindo ${visiveis.length} de ${clientes.length} clientes`}</span></footer>
        </section>
      </main>
    </div>
  );
}
