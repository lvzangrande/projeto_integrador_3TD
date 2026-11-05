import "./figuraErro.css";

export default function FiguraErro() {
  return (
    <div className="figura-erro">
      <div className="tv-container">
        <div className="tv-screen">
          <div className="static" />
          <div className="error-text">ERROR</div>
        </div>
        <div className="tv-stand" />
      </div>
    </div>
  );
}
