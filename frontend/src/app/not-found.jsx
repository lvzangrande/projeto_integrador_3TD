import FiguraNotFound from "@/components/figuraNotFound";
import "./not-found.css";

export default function NotFound() {
  return (
    <main className="pagina-nao-encontrada">
      <div className="pagina-nao-encontrada__conteudo">
        <h2 className="pagina-nao-encontrada__titulo">Página não encontrada</h2>
        <p className="pagina-nao-encontrada__texto">
          Desculpe, a página que você está procurando não existe.
        </p>
        <FiguraNotFound />
      </div>
    </main>
  );
}
