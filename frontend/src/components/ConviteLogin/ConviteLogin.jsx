import "./ConviteLogin.css";

export default function ConviteLogin() {
  return (
    <a className="convite" href="#login" aria-label="Rolar para o login">
      <span className="convite__icone" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      </span>
      <span className="convite__textos">
        <strong className="convite__titulo">Login</strong>
        <span className="convite__dica">Role para baixo para entrar</span>
      </span>
      <svg
        className="convite__seta"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </a>
  );
}
