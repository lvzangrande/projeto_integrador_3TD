import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import RegistrosTable from "@/components/Tabelas/Registros/registrostable";
import "./historico_reunioes.css";

export default function historicodeReunioes(){
    
    
    return(
        <div className="affiliate-history-page">
            <BotaoVoltar/>
            <RegistrosTable/>
        </div>
    )
}
