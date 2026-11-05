import FiguraLoading from "@/components/figuraLoading";
import "./loading.css";

export default function Loading() {
  return (
    <main className="pagina-carregando">
      <div className="pagina-carregando__conteudo">
        <h2 className="pagina-carregando__titulo">Carregando...</h2>
        <FiguraLoading />
      </div>
    </main>
  );
}
