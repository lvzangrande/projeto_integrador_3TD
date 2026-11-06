import Link from "next/link";
import NotFoundScene from "@/components/NotFoundScene";
import "./not-found.css";

export default function NotFound() {
  return (
    <main className="pagina-nao-encontrada">
      <NotFoundScene />
      <header className="pagina-nao-encontrada__cabecalho">
        <Link className="pagina-nao-encontrada__marca" href="/" aria-label="WAPI, voltar ao início">
          <img src="/logo-wapi.png" alt="WAPI" width="147" height="62" />
        </Link>
      </header>

      <section className="pagina-nao-encontrada__conteudo" aria-labelledby="not-found-titulo">
        <p className="pagina-nao-encontrada__codigo">404</p>
        <p className="pagina-nao-encontrada__rotulo">Página não encontrada</p>
        <h1 className="pagina-nao-encontrada__titulo" id="not-found-titulo">
          Este endereço não existe
        </h1>
        <p className="pagina-nao-encontrada__texto">
          Verifique o endereço ou volte ao início.
        </p>
        <Link className="pagina-nao-encontrada__botao" href="/">
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
