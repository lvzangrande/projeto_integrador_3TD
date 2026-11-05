"use client";

import FiguraErro from "@/components/figuraErro";
import "./error.css";

export default function Error() {
  return (
    <main className="pagina-erro">
      <div className="pagina-erro__conteudo">
        <h2 className="pagina-erro__titulo">Erro 404</h2>
        <p className="pagina-erro__texto">
          Algo deu errado ao carregar esta página.
        </p>
        <FiguraErro />
      </div>
    </main>
  );
}
