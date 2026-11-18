import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import HistoricoReunioes from "./HistoricoReunioes.jsx";
import "./historico_reunioes.css";

export default function HistoricoDeReunioes() {
  return (
    <div className="affiliate-history-page">
      <BotaoVoltar />
      <HistoricoReunioes />
    </div>
  );
}
