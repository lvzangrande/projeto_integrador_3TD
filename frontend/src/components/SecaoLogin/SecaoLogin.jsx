import "./SecaoLogin.css";
import AguaViva from "@/components/AguaViva/AguaViva";
import BolhasSubindo from "@/components/BolhasSubindo/BolhasSubindo";
import ConviteLogin from "@/components/ConviteLogin/ConviteLogin";
import OndasAnimadas from "@/components/OndasAnimadas/OndasAnimadas";
import RaiosDeLuz from "@/components/RaiosDeLuz/RaiosDeLuz";
import VazamentoCano from "@/components/VazamentoCano/VazamentoCano";

// Tela visual do login. O envio do formulário ainda não está implementado.
export default function SecaoLogin() {
  return (
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
      <p className="login__lema">Cada gota conta.</p>

      <div className="login__posicao">
        <div className="login__cartao">
          <ConviteLogin />

          <div className="login__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="login__logo-imagem" src="/logo-wapi.png" alt="WAPI" width="220" height="93" />
          </div>

          <div className="login__boas-vindas">
            <h2 className="login__titulo">Bem-vindo de volta</h2>
            <p className="login__subtitulo">
              Acesse sua conta para acompanhar o consumo e os alertas da sua rede.
            </p>
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
    </section>
  );
}
