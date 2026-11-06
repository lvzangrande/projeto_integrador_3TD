import Link from "next/link";
import LoadingScene from "@/components/LoadingScene";
import "./loading.css";

export default function Loading() {
  return (
    <main className="pagina-carregando">
      <header className="pagina-carregando__cabecalho">
        <Link className="pagina-carregando__marca" href="/" aria-label="WAPI, voltar ao início">
          <img src="/logo-wapi.png" alt="WAPI" width="147" height="62" />
        </Link>
      </header>
      <LoadingScene />
    </main>
  );
}
