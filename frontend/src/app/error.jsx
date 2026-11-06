"use client";

import Link from "next/link";
import ErrorScene from "@/components/ErrorScene";
import ErrorMark from "@/components/ErrorScene/ErrorMark";
import "./error.css";

export default function Error() {
  return (
    <main className="pagina-erro">
      <ErrorScene />
      <header className="pagina-erro__cabecalho">
        <Link className="pagina-erro__marca" href="/" aria-label="WAPI, voltar ao início">
          <img src="/logo-wapi.png" alt="WAPI" width="147" height="62" />
        </Link>
      </header>

      <section className="pagina-erro__conteudo" aria-labelledby="erro-titulo">
        <ErrorMark />
        <h1 className="pagina-erro__titulo" id="erro-titulo">
          Não foi possível carregar esta página
        </h1>
        <p className="pagina-erro__texto">Ocorreu um erro inesperado.</p>
        <Link className="pagina-erro__botao" href="/">
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
