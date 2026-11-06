import "./NotFoundScene.css";

export default function NotFoundScene() {
  return (
    <div className="not-found-cena" aria-hidden="true">
      <div className="not-found-cena__chao" />
      <div className="not-found-cena__pocas">
        <span className="not-found-cena__poca not-found-cena__poca--1" />
        <span className="not-found-cena__poca not-found-cena__poca--2" />
        <span className="not-found-cena__poca not-found-cena__poca--3">
          <i className="not-found-cena__onda" />
          <i className="not-found-cena__onda not-found-cena__onda--atrasada" />
        </span>
        <span className="not-found-cena__poca not-found-cena__poca--4" />
        <span className="not-found-cena__poca not-found-cena__poca--5" />
        <span className="not-found-cena__poca not-found-cena__poca--6" />
      </div>
      <svg className="not-found-cena__passaro" viewBox="0 0 120 100" fill="none">
        <path d="M25 61c3-18 20-31 43-31 12 0 21 4 28 12l15 3-12 8c-2 19-18 32-39 32-14 0-26-7-32-18l-16 1 13-7Z" fill="#d6eaf1" />
        <path d="M52 52c10-12 26-13 37-4-4 14-16 24-30 25-5-5-8-12-7-21Z" fill="#8ec6df" />
        <circle cx="86" cy="43" r="2.5" fill="#143b55" />
        <path d="m107 42 12 3-11 5" fill="#e6ad76" />
        <path d="M46 82v8m16-8v8m-22 0h13m3 0h13" stroke="#e6ad76" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 53c-10-7-18-6-24-2 6 0 10 3 13 9" stroke="#edf8fc" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
