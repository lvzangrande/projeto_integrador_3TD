import "./raiosDeLuz.css";

const FEIXES = [
  { x: 4, largura: 120, rotacao: 16, atraso: 0, duracao: 9 },
  { x: 20, largura: 70, rotacao: 12, atraso: -3, duracao: 7 },
  { x: 38, largura: 150, rotacao: 18, atraso: -5, duracao: 11 },
  { x: 58, largura: 80, rotacao: 14, atraso: -2, duracao: 8 },
  { x: 74, largura: 130, rotacao: 17, atraso: -6, duracao: 10 },
  { x: 90, largura: 90, rotacao: 13, atraso: -4, duracao: 9 },
];

export default function RaiosDeLuz({ variante = "clara" }) {
  return (
    <div className={`raios raios--${variante}`} aria-hidden="true">
      {FEIXES.map((feixe) => (
        <span
          key={feixe.x}
          className="raios__feixe"
          style={{
            "--x": `${feixe.x}%`,
            "--largura": `${feixe.largura}px`,
            "--rotacao": `${feixe.rotacao}deg`,
            "--atraso": `${feixe.atraso}s`,
            "--duracao": `${feixe.duracao}s`,
          }}
        />
      ))}
    </div>
  );
}
