"use client";

import "./esqueceu_senha.css";
import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { mascararCpf, somenteDigitos, validarCpf } from "@/components/Form/utils.jsx";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

const MAXIMO_CARACTERES = 72;
function senhaValida(senha) {
  return senha.length >= 8 && senha.length <= MAXIMO_CARACTERES && /[A-Za-z]/.test(senha) && /\d/.test(senha);
}

export default function EsqueceuSenha() {
  const [metodo, setMetodo] = useState("cpf");
  const [etapa, setEtapa] = useState("identificacao");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function escolherMetodo(novoMetodo) {
    if (enviando) return;
    setMetodo(novoMetodo);
    setEtapa("identificacao");
    setErro("");
    setCodigo("");
    setSenha("");
    setConfirmacao("");
  }

  async function solicitar(evento) {
    evento.preventDefault();
    if (enviando) return;
    if (metodo === "cpf" && !validarCpf(cpf)) { setErro("Digite um CPF válido."); return; }
    if (metodo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErro("Digite um endereço de e-mail válido."); return; }
    setErro("");
    setEnviando(true);
    try {
      if (metodo === "cpf") {
        await apiRequest("/auth/esqueci-senha", { method: "POST", body: JSON.stringify({ cpf: somenteDigitos(cpf) }) });
        setEtapa("codigo");
      } else {
        await apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
        setEtapa("email-enviado");
      }
    } catch (error) {
      setErro(error.message || "Não foi possível solicitar a redefinição agora. Tente novamente.");
    } finally { setEnviando(false); }
  }

  async function redefinirPorCpf(evento) {
    evento.preventDefault();
    if (!/^\d{6}$/.test(codigo)) { setErro("Digite o código de 6 números recebido por SMS."); return; }
    if (!senhaValida(senha)) { setErro("A senha deve ter entre 8 e 72 caracteres e conter letras e números."); return; }
    if (senha !== confirmacao) { setErro("As senhas não coincidem."); return; }
    setErro(""); setEnviando(true);
    try {
      await apiRequest("/auth/redefinir-senha", { method: "POST", body: JSON.stringify({ cpf: somenteDigitos(cpf), codigo, senha }) });
      setEtapa("concluido");
    } catch (error) { setErro(error.message || "Não foi possível alterar a senha. Confira o código e tente novamente."); }
    finally { setEnviando(false); }
  }

  async function redefinirPorEmail(evento) {
    evento.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) { setErro("Este link não contém um token válido. Solicite um novo link."); return; }
    if (!senhaValida(senha)) { setErro("A senha deve ter entre 8 e 72 caracteres e conter letras e números."); return; }
    if (senha !== confirmacao) { setErro("As senhas não coincidem."); return; }
    setErro(""); setEnviando(true);
    try {
      await apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, senha }) });
      setEtapa("concluido");
    } catch (error) { setErro(error.message || "Link inválido ou expirado. Solicite um novo link."); }
    finally { setEnviando(false); }
  }

  const redefinindo = metodo === "email" && new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).has("token");
  const titulo = etapa === "concluido" ? "Senha alterada" : etapa === "email-enviado" ? "Confira seu e-mail" : redefinindo ? "Criar nova senha" : etapa === "codigo" ? "Digite o código SMS" : "Esqueceu a senha?";
  const subtitulo = etapa === "concluido" ? "Sua nova senha já está valendo. Use-a para entrar na sua conta."
    : etapa === "email-enviado" ? "Se o e-mail informado estiver cadastrado, enviaremos um link para redefinir sua senha. O link expira em 30 minutos."
      : redefinindo ? "Use de 8 a 72 caracteres, com letras e números."
        : etapa === "codigo" ? "Digite o código de 6 números enviado ao telefone cadastrado. Ele expira em 5 minutos."
          : metodo === "cpf" ? "Informe o CPF da sua conta. Enviaremos um código para o telefone cadastrado."
            : "Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.";

  return (
    <main className="pagina-esqueceu-senha">
      <RaiosDeLuz variante="profunda" /><BolhasSubindo variante="profunda" quantidade={36} semente={31} />
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--grande"><AguaViva sufixo="esqueceu-senha-a" /></div>
      <div className="pagina-esqueceu-senha__agua-viva pagina-esqueceu-senha__agua-viva--pequena"><AguaViva sufixo="esqueceu-senha-b" /></div>
      <section className="pagina-esqueceu-senha__cartao" aria-labelledby="esqueceu-senha-titulo">
        <Link className="pagina-esqueceu-senha__logo" href="/" aria-label="WAPI, voltar ao início"><img className="pagina-esqueceu-senha__logo-imagem" src="/logo-wapi.png" alt="WAPI" width="220" height="93" /></Link>
        <div className="pagina-esqueceu-senha__cabecalho">
          <span className="pagina-esqueceu-senha__icone" aria-hidden="true">✉</span>
          <h1 className="pagina-esqueceu-senha__titulo" id="esqueceu-senha-titulo">{titulo}</h1>
          <p className="pagina-esqueceu-senha__subtitulo" role={etapa === "email-enviado" || etapa === "concluido" ? "status" : undefined}>{subtitulo}</p>
        </div>
        {etapa === "identificacao" && !redefinindo && <>
          <div className="pagina-esqueceu-senha__metodos" role="group" aria-label="Método de recuperação">
            <button type="button" className={`pagina-esqueceu-senha__metodo${metodo === "cpf" ? " pagina-esqueceu-senha__metodo--ativo" : ""}`} aria-pressed={metodo === "cpf"} onClick={() => escolherMetodo("cpf")}>Por CPF e SMS</button>
            <button type="button" className={`pagina-esqueceu-senha__metodo${metodo === "email" ? " pagina-esqueceu-senha__metodo--ativo" : ""}`} aria-pressed={metodo === "email"} onClick={() => escolherMetodo("email")}>Por e-mail</button>
          </div>
          <form className="pagina-esqueceu-senha__formulario" onSubmit={solicitar} noValidate>
            <div className="pagina-esqueceu-senha__grupo"><div className="pagina-esqueceu-senha__campo">
              <label className="pagina-esqueceu-senha__rotulo" htmlFor={metodo === "cpf" ? "cpf-recuperacao" : "email-recuperacao"}>{metodo === "cpf" ? "CPF" : "E-mail"}</label>
              {metodo === "cpf" ? <input className="pagina-esqueceu-senha__entrada" id="cpf-recuperacao" name="cpf" type="text" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" maxLength={14} value={cpf} onChange={(e) => { setCpf(mascararCpf(e.target.value)); setErro(""); }} aria-invalid={erro ? "true" : "false"} />
                : <input className="pagina-esqueceu-senha__entrada" id="email-recuperacao" name="email" type="email" autoComplete="email" maxLength={100} value={email} onChange={(e) => { setEmail(e.target.value); setErro(""); }} aria-invalid={erro ? "true" : "false"} />}
            </div>{erro && <p className="pagina-esqueceu-senha__erro" role="alert">{erro}</p>}</div>
            <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>{enviando ? "Enviando..." : metodo === "cpf" ? "Enviar código por SMS" : "Enviar link de redefinição"}</button>
          </form>
        </>}
        {(etapa === "codigo" || redefinindo) && <form className="pagina-esqueceu-senha__formulario" onSubmit={redefinindo ? redefinirPorEmail : redefinirPorCpf} noValidate>
          {etapa === "codigo" && <div className="pagina-esqueceu-senha__grupo"><div className="pagina-esqueceu-senha__campo"><label className="pagina-esqueceu-senha__rotulo" htmlFor="codigo-sms">Código SMS</label><input className="pagina-esqueceu-senha__entrada" id="codigo-sms" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={codigo} onChange={(e) => { setCodigo(somenteDigitos(e.target.value).slice(0, 6)); setErro(""); }} /></div></div>}
          <div className="pagina-esqueceu-senha__grupo"><div className="pagina-esqueceu-senha__campo"><label className="pagina-esqueceu-senha__rotulo" htmlFor="nova-senha">Nova senha</label><input className="pagina-esqueceu-senha__entrada" id="nova-senha" type="password" autoComplete="new-password" maxLength={MAXIMO_CARACTERES} value={senha} onChange={(e) => { setSenha(e.target.value); setErro(""); }} /></div></div>
          <div className="pagina-esqueceu-senha__grupo"><div className="pagina-esqueceu-senha__campo"><label className="pagina-esqueceu-senha__rotulo" htmlFor="confirmar-senha">Confirmar nova senha</label><input className="pagina-esqueceu-senha__entrada" id="confirmar-senha" type="password" autoComplete="new-password" maxLength={MAXIMO_CARACTERES} value={confirmacao} onChange={(e) => { setConfirmacao(e.target.value); setErro(""); }} /></div></div>
          {erro && <p className="pagina-esqueceu-senha__erro" role="alert">{erro}</p>}
          <button className="pagina-esqueceu-senha__botao" type="submit" disabled={enviando}>{enviando ? "Salvando..." : "Salvar nova senha"}</button>
          {erro && redefinindo && <Link className="pagina-esqueceu-senha__alternar" href="/esqueceu_senha">Solicitar novo link</Link>}
        </form>}
        {(etapa === "email-enviado" || etapa === "concluido") && <Link className="pagina-esqueceu-senha__botao" href="/#login">Ir para o login</Link>}
        <Link className="pagina-esqueceu-senha__voltar" href="/#login">Voltar ao login</Link>
      </section>
    </main>
  );
}
