import "./LoadingScene.css";

export default function LoadingScene() {
  return (
    <>
      <div className="loading-cena__ondas" aria-hidden="true">
        <svg className="loading-cena__onda loading-cena__onda--1" viewBox="0 0 1440 360" preserveAspectRatio="none">
          <defs>
            <linearGradient id="loading-mar-distante" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#39b9dc" stopOpacity=".14" />
              <stop offset="1" stopColor="#0876a5" stopOpacity=".02" />
            </linearGradient>
          </defs>
          <path className="loading-cena__onda-corpo" fill="url(#loading-mar-distante)" d="M-180 112C-40 68 88 83 230 117c134 32 231 47 365 13 145-36 250-72 408-39 177 36 306 88 617 13v310H-180Z" />
          <path className="loading-cena__onda-crista" d="M-180 112C-40 68 88 83 230 117c134 32 231 47 365 13 145-36 250-72 408-39 177 36 306 88 617 13" />
          <path className="loading-cena__onda-detalhe" d="M-180 202c156-34 265-29 398-2 147 30 242 28 376-7 173-45 291-34 428 0 145 36 273 36 606 4" />
        </svg>
        <svg className="loading-cena__onda loading-cena__onda--2" viewBox="0 0 1440 360" preserveAspectRatio="none">
          <defs>
            <linearGradient id="loading-mar-intermediario" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#1c9ec7" stopOpacity=".13" />
              <stop offset="1" stopColor="#075886" stopOpacity=".03" />
            </linearGradient>
          </defs>
          <path className="loading-cena__onda-corpo" fill="url(#loading-mar-intermediario)" d="M-180 164c142-48 257-45 399-13 142 33 239 34 379-3 150-40 250-46 399-9 160 40 285 49 613 7v284H-180Z" />
          <path className="loading-cena__onda-crista" d="M-180 164c142-48 257-45 399-13 142 33 239 34 379-3 150-40 250-46 399-9 160 40 285 49 613 7" />
          <path className="loading-cena__onda-detalhe" d="M-180 250c142-22 250-15 394 9 144 24 247 26 394-2 155-30 252-29 395 0 143 29 291 29 607 8" />
        </svg>
        <svg className="loading-cena__onda loading-cena__onda--3" viewBox="0 0 1440 360" preserveAspectRatio="none">
          <defs>
            <linearGradient id="loading-mar-proximo" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#138cb4" stopOpacity=".17" />
              <stop offset="1" stopColor="#06446e" stopOpacity=".07" />
            </linearGradient>
          </defs>
          <path className="loading-cena__onda-corpo" fill="url(#loading-mar-proximo)" d="M-180 214c134-38 250-38 397-4 148 34 251 39 395 7 147-33 249-35 396 1 152 37 294 46 597 10v250H-180Z" />
          <path className="loading-cena__onda-crista" d="M-180 214c134-38 250-38 397-4 148 34 251 39 395 7 147-33 249-35 396 1 152 37 294 46 597 10" />
          <path className="loading-cena__onda-detalhe" d="M-180 285c149-17 256-11 400 12 146 23 248 25 392 3 154-24 257-23 402 0 151 24 296 24 593 7" />
        </svg>
      </div>

      <section className="loading-cena__conteudo" aria-live="polite" aria-busy="true">
        <span className="loading-cena__anel" role="status" aria-label="Carregando">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle className="loading-cena__anel-trilho" cx="32" cy="32" r="27" />
            <circle className="loading-cena__anel-progresso" cx="32" cy="32" r="27" />
          </svg>
        </span>
        <h1 className="loading-cena__titulo">
          Carregando<span className="loading-cena__pontos" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </h1>
      </section>
    </>
  );
}
