import nodemailer from "nodemailer";

export function criarEmailService({ env = process.env, nodemailerModule = nodemailer } = {}) {
  const gmailUser = env.GMAIL_USER?.trim();
  const appPassword = env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  const fromName = env.MAIL_FROM_NAME?.trim() || "WAPI";

  if (!gmailUser || !appPassword) {
    throw new Error("Configure GMAIL_USER e GMAIL_APP_PASSWORD no ambiente do backend.");
  }
  if (!/^[^\s@]+@gmail\.com$/i.test(gmailUser)) {
    throw new Error("GMAIL_USER deve ser um endereço Gmail válido.");
  }

  const transporter = nodemailerModule.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: appPassword },
  });

  async function verificarConexao() {
    try {
      return await transporter.verify();
    } catch {
      throw new Error("Não foi possível verificar a conexão SMTP do Gmail.");
    }
  }

  async function enviarLinkRedefinicao({ destinatario, link }) {
    try {
      await transporter.sendMail({
        from: { name: fromName, address: gmailUser },
        to: destinatario,
        subject: "Redefinição de senha — WAPI",
        text: `Recebemos uma solicitação para redefinir sua senha. Acesse: ${link}\n\nEste link expira em 30 minutos. Se você não solicitou, ignore esta mensagem.`,
        html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#0a3560;color:white;text-decoration:none;border-radius:6px">Redefinir minha senha</a></p><p>Este link expira em 30 minutos. Se você não solicitou, ignore esta mensagem.</p><p>Se o botão não funcionar, copie este endereço:<br><a href="${link}">${link}</a></p>`,
      });
    } catch {
      throw new Error("Falha ao enviar e-mail de recuperação pelo Gmail SMTP.");
    }
  }

  return { enviarLinkRedefinicao, verificarConexao };
}
