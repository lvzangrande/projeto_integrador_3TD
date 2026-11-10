import "./page.css";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import MedidorAgua from "@/components/Login/MedidorAgua";
import OndasAnimadas from "@/components/Login/OndasAnimadas";
import PonteiroParalaxe from "@/components/Login/ponteiroParalaxe";
import ProgressoRolagem from "@/components/Login/progressoRolagem";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";
import TituloAgua from "@/components/Login/TituloAgua";
import VazamentoCano from "@/components/Login/VazamentoCano";

const litrosPoupadosPorDia = "000";
const nivelDoReservatorio = 0.55;

const textos = {
  titulo: "Sistema de controle de água",
  descricao: "Acompanhe o caminho da água, entenda seu consumo e encontre oportunidades para cuidar melhor de cada recurso.",
  lema: "Cada gota conta.",
  boasVindas: "Bem-vindo de volta",
  subtitulo:
    "Acesse sua conta para acompanhar o consumo, consultar indicadores e receber alertas da sua rede.",
};

export default async function Inicio() {
  return (
    <main className="pagina">
      <ProgressoRolagem />
      <PonteiroParalaxe />

      <section id="inicio" className="inicio">
        <RaiosDeLuz variante="clara" />
        <BolhasSubindo variante="clara" quantidade={26} semente={11} />

        <header className="inicio__cabecalho">
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

      <section className="sobre" aria-labelledby="sobre-titulo">
        <div className="sobre__conteudo">
          <div className="sobre__cabecalho sobre__item-scroll">
            <span className="sobre__sobretitulo">Cuidado que faz diferença</span>
            <h2 id="sobre-titulo" className="sobre__titulo">
              Mais clareza para cuidar de cada gota
            </h2>
            <p className="sobre__descricao">
              Com uma visão clara do consumo, fica mais fácil entender o que
              acontece em cada ponto da rede. Acompanhe os indicadores, observe
              mudanças e transforme os dados em decisões mais conscientes.
            </p>
          </div>

          <div className="sobre__cards">
            <article className="sobre__card sobre__item-scroll">
              <span className="sobre__numero">01</span>
              <h3>Monitore o consumo</h3>
              <p>Consulte os principais indicadores da rede em uma tela simples. Compare setores e períodos para entender onde a água está sendo utilizada.</p>
            </article>
            <article className="sobre__card sobre__item-scroll">
              <span className="sobre__numero">02</span>
              <h3>Identifique alertas</h3>
              <p>Receba sinais sobre situações que merecem atenção e investigue possíveis alterações antes que elas se tornem um problema maior.</p>
            </article>
            <article className="sobre__card sobre__item-scroll">
              <span className="sobre__numero">03</span>
              <h3>Faça escolhas melhores</h3>
              <p>Use as informações do sistema para definir prioridades, acompanhar mudanças e orientar ações de economia no cotidiano.</p>
            </article>
            <article className="sobre__card sobre__item-scroll">
              <span className="sobre__numero">04</span>
              <h3>Entenda seu histórico</h3>
              <p>Consulte os registros anteriores para reconhecer padrões, comparar resultados e compreender como o uso varia ao longo do tempo.</p>
            </article>
            <article className="sobre__card sobre__item-scroll">
              <span className="sobre__numero">05</span>
              <h3>Tenha mais previsibilidade</h3>
              <p>Com informações reunidas e atualizadas, sua equipe consegue organizar prioridades e planejar as próximas ações com mais segurança.</p>
            </article>
            <article className="sobre__card sobre__item-scroll">
              <span className="sobre__numero">06</span>
              <h3>Compartilhe informação</h3>
              <p>Compartilhe uma leitura comum dos indicadores para apoiar conversas, alinhar responsabilidades e acompanhar o resultado das decisões.</p>
            </article>
          </div>
          <div className="sobre__mensagem sobre__item-scroll">
            <h3>Pequenos sinais ajudam a cuidar melhor</h3>
            <p>
              Mudanças no consumo podem indicar novos hábitos, aumento de
              demanda ou uma perda que precisa ser investigada. Ao acompanhar
              os dados com frequência, você consegue comparar períodos,
              registrar o que foi feito e verificar se cada ação trouxe o
              resultado esperado. Assim, o cuidado com a água passa a fazer
              parte da rotina de toda a equipe.
            </p>
          </div>
        </div>
      </section>
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
            <div className="login__logo">
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
        <a className="convite" href="#login" aria-label="Rolar para o login">
          <span className="convite__icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </span>
          <span className="convite__textos">
            <strong className="convite__titulo">Login</strong>
            <span className="convite__dica">Role para baixo para entrar</span>
          </span>
          <svg className="convite__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>
    </main>
  );
}
