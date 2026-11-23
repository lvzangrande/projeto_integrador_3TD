"use client";

import { useId, useState } from "react";
import { IconEye, IconEyeOff, IconLock } from "./icones";
import "./formbase.css";
import "./Campo.css";

/* Campo de formulário: rótulo + caixa com ícone à esquerda + mensagem de erro.
 *
 * Props:
 *  - label     texto do rótulo
 *  - icone     componente de ícone exibido à esquerda
 *  - erro      mensagem de erro (string) — deixa a borda vermelha e liga o aria-invalid
 *  - direita   nó opcional à direita dentro da caixa (ex.: botão do olho)
 *  - ...input  todo o resto (value, onChange, type, placeholder, autoComplete...) vai para o <input>
 */
export function Campo({ label, icone: Icone, erro, direita, id, className = "", ...input }) {
  const gerado = useId();
  const campoId = id ?? gerado;
  const erroId = `${campoId}-erro`;

  return (
    <div className={`cf-campo ${className}`}>
      <label className="cf-label" htmlFor={campoId}>
        {label}
      </label>

      <div className={`cf-input ${erro ? "has-error" : ""}`}>
        {Icone && <Icone size={22} className="cf-input__icone" />}
        <input
          id={campoId}
          aria-invalid={erro ? "true" : undefined}
          aria-describedby={erro ? erroId : undefined}
          {...input}
        />
        {direita}
      </div>

      {erro && (
        <p id={erroId} className="cf-erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

/* Campo de senha com botão para mostrar/ocultar. Aceita as mesmas props do Campo. */
export function CampoSenha(props) {
  const [visivel, setVisivel] = useState(false);

  return (
    <Campo
      {...props}
      type={visivel ? "text" : "password"}
      icone={IconLock}
      direita={
        <button
          type="button"
          className="cf-olho"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
        >
          {visivel ? <IconEyeOff size={22} /> : <IconEye size={22} />}
        </button>
      }
    />
  );
}