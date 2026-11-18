"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const dados = new FormData(evento.currentTarget);
    setErro("");
    setEnviando(true);

    try {
      const usuario = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: dados.get("email"), senha: dados.get("senha") }),
      });

      if (usuario.categoria === "Filiado") {
        router.replace("/filiado");
      } else if (usuario.categoria === "Admin") {
        router.replace("/admin");
      } else {
        await apiRequest("/auth/logout", { method: "POST" });
        setErro("A área de cliente ainda não está disponível.");
      }
    } catch (error) {
      setErro(error.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="login__formulario" onSubmit={entrar} noValidate>
      <div className="login__campo">
        <label className="login__rotulo" htmlFor="usuario">E-mail</label>
        <input
          className="login__entrada"
          id="usuario"
          name="email"
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="username"
          required
        />
      </div>

      <div className="login__campo">
        <label className="login__rotulo" htmlFor="senha">Senha</label>
        <input
          className="login__entrada"
          id="senha"
          name="senha"
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />
      </div>

      <Link className="login__esqueceu-senha" href="/esqueceu_senha">
        Esqueceu a senha?
      </Link>
      {erro && <p role="alert" style={{ color: "#a21d34", margin: 0 }}>{erro}</p>}
      <button className="login__botao" type="submit" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
