import "./SecaoInicio.css";
import AguaViva from "@/components/AguaViva/AguaViva";
import BolhasSubindo from "@/components/BolhasSubindo/BolhasSubindo";
import MedidorAgua from "@/components/MedidorAgua/MedidorAgua";
import RaiosDeLuz from "@/components/RaiosDeLuz/RaiosDeLuz";
import TituloAgua from "@/components/TituloAgua/TituloAgua";

// Valor de exemplo: trocar pelo dado real vindo da API.
const litrosPoupadosPorDia = "000";

export default function SecaoInicio() {
  return (
    <section id="inicio" className="inicio">
      <RaiosDeLuz variante="clara" />
      <BolhasSubindo variante="clara" quantidade={26} semente={11} />

      <header className="inicio__cabecalho">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="inicio__logo" src="/logo-wapi.png" alt="WAPI" width="220" height="93" />
      </header>

      <div className="inicio__palco">
        <div className="inicio__conteudo">
          <TituloAgua>Sistema de controle de água</TituloAgua>
          <p className="inicio__descricao">Faça seu login e acompanhe consumo e alertas.</p>

          <div className="inicio__dado">
            <MedidorAgua nivel={0.55} />
            <div className="inicio__dado-textos">
              <span className="inicio__dado-valor">{litrosPoupadosPorDia} L</span>
              <span className="inicio__dado-texto">de água poupada por dia</span>
            </div>
          </div>
        </div>

        <div className="inicio__ilustracao">
          <AguaViva sufixo="inicio" />
        </div>
      </div>
    </section>
  );
}
