"use client";

import { useId } from "react";
import "./formbase.css";
import "./SecaoForm.css";

/* Seção numerada do formulário: círculo com o número, título, descrição e conteúdo.
 * O separador entre seções é feito por CSS (.cf-secao + .cf-secao). */
export default function SecaoForm({ numero, titulo, descricao, children }) {
  const tituloId = useId();

  return (
    <section className="cf-secao" aria-labelledby={tituloId}>
      <span className="cf-secao__num" aria-hidden="true">
        {numero}
      </span>

      <div className="cf-secao__cab">
        <h3 id={tituloId} className="cf-secao__titulo">
          {titulo}
        </h3>
        {descricao && <p className="cf-secao__desc">{descricao}</p>}
      </div>

      <div className="cf-secao__conteudo">{children}</div>
    </section>
  );
}