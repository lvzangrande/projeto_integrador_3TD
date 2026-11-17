import "./ErrorMark.css";

export default function ErrorMark() {
  return (
    <span className="erro-marca" aria-hidden="true">
      <svg viewBox="0 0 72 72">
        <path className="erro-marca__triangulo" d="M32.1 8.5a4.5 4.5 0 0 1 7.8 0l26.2 45.4a4.5 4.5 0 0 1-3.9 6.8H9.8a4.5 4.5 0 0 1-3.9-6.8L32.1 8.5Z" />
        <path className="erro-marca__haste" d="M36 25v17" />
        <circle className="erro-marca__ponto" cx="36" cy="49" r="2.8" />
      </svg>
    </span>
  );
}
