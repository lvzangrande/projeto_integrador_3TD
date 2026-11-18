import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import HistoricoReunioes from "./HistoricoReunioes";
import "./historico_reunioes.css";

export default function historicodeReunioes(){
    
    
    return(
        <div className="affiliate-history-page">
            <BotaoVoltar/>
            <RegistrosTable/>
        </div>
    )
}
