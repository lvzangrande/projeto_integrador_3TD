"use client";

import "../esqueceu_senha/esqueceu_senha.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

const MAXIMO_CARACTERES = 72;
function senhaValida(senha) {
  return senha.length >= 8 && senha.length <= MAXIMO_CARACTERES && /[A-Za-z]/.test(senha) && /\d/.test(senha);
}

export default function ResetPassword() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function redefinir(evento) {
    evento.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) { setErro("Este link não contém um token válido. Solicite um novo link."); return; }
    if (!senhaValida(senha)) { setErro("A senha deve ter entre 8 e 72 caracteres e conter letras e números."); return; }
    if (senha !== confirmacao) { setErro("As senhas não coincidem."); return; }
    setErro("");
    setEnviando(true);
    try {
      await apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, senha }) });
      router.replace("/#login");
    } catch (error) {
      setErro(error.message || "Link inválido ou expirado. Solicite um novo link.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-esqueceu-senha">
      <RaiosDeLuz variante="profunda" />
      <BolhasSubindo variante="profunda" quantidade={36} semente={31} />
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--grande"><AguaViva sufixo="reset-senha-a" /></div>
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--pequena"><AguaViva sufixo="reset-senha-b" /></div>
      <section className="pagina-esqueceu-senha__cartao" aria-labelledby="reset-senha-titulo">
        <Link className="pagina-esqueceu-senha__logo" href="/" aria-label="WAPI, voltar ao início"><img className="pagina-esqueceu-senha__logo-imagem" src="/logo-wapi.png" alt="WAPI" width="220" height="93" /></Link>
        <div className="pagina-esqueceu-senha__cabecalho">
          <span className="pagina-esqueceu-senha__icone" aria-hidden="true">✉</span>
          <h1 className="pagina-esqueceu-senha__titulo" id="reset-senha-titulo">Criar nova senha</h1>
          <p className="pagina-esqueceu-senha__subtitulo">Use de 8 a 72 caracteres, com letras e números.</p>
        </div>
        <form className="pagina-esqueceu-senha__formulario" onSubmit={redefinir} noValidate>
          <div className="pagina-esqueceu-senha__grupo"><div className="pagina-esqueceu-senha__campo"><label className="pagina-esqueceu-senha__rotulo" htmlFor="nova-senha">Nova senha</label><input className="pagina-esqueceu-senha__entrada" id="nova-senha" type="password" autoComplete="new-password" maxLength={MAXIMO_CARACTERES} value={senha} onChange={(evento) => { setSenha(evento.target.value); setErro(""); }} /></div></div>
          <div className="pagina-esqueceu-senha__grupo"><div className="pagina-esqueceu-senha__campo"><label className="pagina-esqueceu-senha__rotulo" htmlFor="confirmar-senha">Confirmar nova senha</label><input className="pagina-esqueceu-senha__entrada" id="confirmar-senha" type="password" autoComplete="new-password" maxLength={MAXIMO_CARACTERES} value={confirmacao} onChange={(evento) => { setConfirmacao(evento.target.value); setErro(""); }} /></div></div>
          {erro && <div><p className="pagina-esqueceu-senha__erro" role="alert">{erro}</p><Link className="pagina-esqueceu-senha__alternar" href="/esqueceu_senha">Solicitar novo link</Link></div>}
          <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>{enviando ? "Salvando..." : "Salvar nova senha"}</button>
        </form>
        <Link className="pagina-esqueceu-senha__voltar" href="/#login">Voltar ao login</Link>
      </section>
    </main>
  );
}
