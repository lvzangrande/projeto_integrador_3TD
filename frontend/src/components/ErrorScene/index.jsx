import "./ErrorScene.css";

export default function ErrorScene() {
  return (
    <div className="erro-cena" aria-hidden="true">
      <div className="erro-cena__chuva">
        {Array.from({ length: 38 }, (_, index) => (
          <span className="erro-cena__gota" key={index} />
        ))}
      </div>
      <div className="erro-cena__brilho" />
    </div>
  );
}
