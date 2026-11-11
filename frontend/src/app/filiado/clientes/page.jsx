"use client"

import "./Meusclientes.css";
import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";

const icones = {
  users: "M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0M3 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1M16 3a4 4 0 0 1 0 8M21 20v-1a4 4 0 0 0-3-4",
  calendar: "M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM8 3v4M16 3v4M3 10h18",
  search: "M4 11a7 7 0 1 0 14 0a7 7 0 0 0-14 0M20 20l-3.5-3.5",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0",
};
function Icon({ name, size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icones[name]} /></svg>; }
const iniciais = (nome) => nome.split(" ").map((p) => p[0]).slice(0, 2).join("");

export default function MeusClientes() {
  const clientes = [];
  return <div className="mc"><div className="mc-voltar-wrap"><BotaoVoltar /></div><main>
    <header className="mc-cabecalho"><div><p className="mc-contexto">ÁREA DO AFILIADO</p><h1>Meus Clientes</h1><p className="subtitulo">Visualize e gerencie os clientes vinculados ao seu perfil de afiliado.</p></div></header>
    <div className="filtros"><label className="busca"><Icon name="search" /><input placeholder="Buscar por nome ou empresa..." /></label></div>
    <section className="cartao"><div className="rolagem"><table><thead><tr>{["Cliente", "Empresa", "Tipo", "Última reunião", "Status", ""].map((t, i) => <th key={i}>{t}</th>)}</tr></thead><tbody>{clientes.length ? clientes.map(c => <tr key={c.nome}><td><div className="cliente"><span className="avatar">{iniciais(c.nome)}</span>{c.nome}</div></td><td className="suave">{c.empresa}</td><td className="suave">{c.tipo}</td><td className="num">{c.data} · {c.hora}</td><td><span className={`status ${c.status === "Ativo" ? "ok" : "pendente"}`}><i/>{c.status}</span></td><td><button className="acao" aria-label={`Visualizar ${c.nome}`}><Icon name="eye"/></button></td></tr>) : <tr><td className="mc-vazio" colSpan={6}>Nenhum cliente encontrado.</td></tr>}</tbody></table></div><footer><span>{clientes.length ? `Exibindo ${clientes.length} clientes` : "Nenhum registro para exibir"}</span></footer></section>
  </main></div>;
}
