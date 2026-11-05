import "./page.css";
import AguaViva from "@/components/login/aguaViva";
import BolhasSubindo from "@/components/login/bolhasSubindo";
import MedidorAgua from "@/components/login/medidorAgua";
import OndasAnimadas from "@/components/login/ondasAnimadas";
import PonteiroParalaxe from "@/components/login/ponteiroParalaxe";
import ProgressoRolagem from "@/components/login/progressoRolagem";
import RaiosDeLuz from "@/components/login/raiosDeLuz";
import TituloAgua from "@/components/login/tituloAgua";
import VazamentoCano from "@/components/login/vazamentoCano";

// Conteúdo da página. Trocar pelos dados reais vindos da API.
const litrosPoupadosPorDia = "000";
const nivelDoReservatorio = 0.55;

const textos = {
  titulo: "Sistema de controle de água",
  descricao: "Faça seu login e acompanhe consumo e alertas.",
  lema: "Cada gota conta.",
  boasVindas: "Bem-vindo de volta",
  subtitulo:
    "Acesse sua conta para acompanhar o consumo e os alertas da sua rede.",
};

export default function Inicio() {
  return (
    <main className="pagina">
      <ProgressoRolagem />
      <PonteiroParalaxe />

      {/* ── primeira tela ─────────────────────────────────────────── */}
      <section id="inicio" className="inicio">
        <RaiosDeLuz variante="clara" />
        <BolhasSubindo variante="clara" quantidade={26} semente={11} />

        <header className="inicio__cabecalho">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="inicio__logo"
            src="/logo-wapi.png"
            alt="WAPI"
            width="220"
            height="93"
          />
        </header>

        <div className="inicio__palco">
          <div className="inicio__conteudo">
            <TituloAgua>{textos.titulo}</TituloAgua>
            <p className="inicio__descricao">{textos.descricao}</p>

            <div className="inicio__dado">
              <MedidorAgua nivel={nivelDoReservatorio} />
              <div className="inicio__dado-textos">
                <span className="inicio__dado-valor">
                  {litrosPoupadosPorDia} L
                </span>
                <span className="inicio__dado-texto">
                  de água poupada por dia
                </span>
              </div>
            </div>
          </div>

          <div className="inicio__ilustracao">
            <AguaViva sufixo="inicio" />
          </div>
        </div>
      </section>

      {/* ── segunda tela: login ───────────────────────────────────── */}
      <section id="login" className="login">
        <OndasAnimadas posicao="acima" />
        <RaiosDeLuz variante="profunda" />
        <BolhasSubindo variante="profunda" quantidade={44} semente={23} />

        <div className="login__agua-viva login__agua-viva--grande">
          <AguaViva sufixo="login-a" />
        </div>
        <div className="login__agua-viva login__agua-viva--pequena">
          <AguaViva sufixo="login-b" />
        </div>

        <VazamentoCano />
        <p className="login__lema">{textos.lema}</p>

        <div className="login__posicao">
          <div className="login__cartao">
            <a className="convite" href="#login" aria-label="Rolar para o login">
              <span className="convite__icone" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </svg>
              </span>
              <span className="convite__textos">
                <strong className="convite__titulo">Login</strong>
                <span className="convite__dica">Role para baixo para entrar</span>
              </span>
              <svg
                className="convite__seta"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </a>

            <div className="login__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="login__logo-imagem"
                src="/logo-wapi.png"
                alt="WAPI"
                width="220"
                height="93"
              />
            </div>

            <div className="login__boas-vindas">
              <h2 className="login__titulo">{textos.boasVindas}</h2>
              <p className="login__subtitulo">{textos.subtitulo}</p>
            </div>

            {/* Tela visual do login. O envio do formulário ainda não está implementado. */}
            <form className="login__formulario" noValidate>
              <div className="login__campo">
                <label className="login__rotulo" htmlFor="usuario">
                  Usuário
                </label>
                <input
                  className="login__entrada"
                  id="usuario"
                  name="usuario"
                  type="text"
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                />
              </div>

              <div className="login__campo">
                <label className="login__rotulo" htmlFor="senha">
                  Senha
                </label>
                <input
                  className="login__entrada"
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                />
              </div>

              <button className="login__esqueceu-senha" type="button">
                Esqueceu a senha?
              </button>
              <button className="login__botao" type="button">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
