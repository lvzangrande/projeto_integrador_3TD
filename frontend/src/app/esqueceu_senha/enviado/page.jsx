import "./email_enviado.css";
import Link from "next/link";
import AguaViva from "@/components/Login/AguaViva";
import BolhasSubindo from "@/components/Login/BolhasSubindo";
import RaiosDeLuz from "@/components/Login/RaiosDeLuz";

// Mostra só o começo do e-mail (ex.: m*****@empresa.com) para não expor o endereço inteiro na tela.
function mascararEmail(email) {
  if (typeof email !== "string") return null;

  const [usuario, dominio, ...resto] = email.trim().slice(0, 100).split("@");
  if (!usuario || !dominio || resto.length > 0) return null;

  const asteriscos = "*".repeat(Math.min(usuario.length - 1, 6));
  return `${usuario[0]}${asteriscos}@${dominio}`;
}

export default async function EmailEnviado({ searchParams }) {
  const { email } = await searchParams;
  const emailMascarado = mascararEmail(Array.isArray(email) ? email[0] : email);

  return (
    <main className="pagina-email-enviado">
      <RaiosDeLuz variante="profunda" />
      <BolhasSubindo variante="profunda" quantidade={36} semente={47} />

      <div className="pagina-email-enviado__agua-viva pagina-email-enviado__agua-viva--grande">
        <AguaViva sufixo="email-enviado-a" />
      </div>
      <div className="pagina-email-enviado__agua-viva pagina-email-enviado__agua-viva--pequena">
        <AguaViva sufixo="email-enviado-b" />
      </div>

      <section className="pagina-email-enviado__cartao" aria-labelledby="email-enviado-titulo">
        <Link className="pagina-email-enviado__logo" href="/" aria-label="WAPI, voltar ao início">
          <img
            className="pagina-email-enviado__logo-imagem"
            src="/logo-wapi.png"
            alt="WAPI"
            width="220"
            height="93"
          />
        </Link>

        <div className="pagina-email-enviado__cabecalho">
          <span className="pagina-email-enviado__icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.5V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6.5" />
              <path d="M3.5 7.5l8.5 6 8.5-6" />
              <path d="M16 18.5l2 2 4-4.5" />
            </svg>
          </span>
          <h1 className="pagina-email-enviado__titulo" id="email-enviado-titulo">
            Verifique seu e-mail
          </h1>
          <p className="pagina-email-enviado__subtitulo">
            Se existir uma conta associada a{" "}
            {emailMascarado ? (
              <strong className="pagina-email-enviado__destaque">{emailMascarado}</strong>
            ) : (
              "este e-mail"
            )}
            , enviamos um link para você criar uma nova senha.
          </p>
        </div>

        <p className="pagina-email-enviado__dica">
          Não encontrou a mensagem? Confira a caixa de spam ou o lixo eletrônico. Por segurança, o link tem validade limitada.
        </p>

        <div className="pagina-email-enviado__acoes">
          <Link className="pagina-email-enviado__botao" href="/#login">
            Voltar ao login
          </Link>
          <Link className="pagina-email-enviado__alternativa" href="/esqueceu_senha">
            Usar outro e-mail
          </Link>
        </div>
      </section>
    </main>
  );
}
