import { MailtrapClient } from "mailtrap";

export function criarEmailService({ env = process.env } = {}) {
  async function enviarLinkRedefinicao({ destinatario, link }) {
    const token = env.MAILTRAP_API_KEY?.trim();
    const fromEmail = env.MAIL_FROM_EMAIL?.trim();
    const fromName = env.MAIL_FROM_NAME?.trim() || "WAPI";
    const usarSandbox = env.MAILTRAP_USE_SANDBOX === "true";
    const sandboxId = usarSandbox ? Number(env.MAILTRAP_SANDBOX_ID) : undefined;

    if (!token || !fromEmail) {
      throw new Error("Configure MAILTRAP_API_KEY e MAIL_FROM_EMAIL no backend/.env.");
    }
    if (usarSandbox && (!Number.isInteger(sandboxId) || sandboxId <= 0)) {
      throw new Error("Configure MAILTRAP_SANDBOX_ID para usar o sandbox Mailtrap.");
    }

    const client = new MailtrapClient({ token, sandbox: usarSandbox, sandboxId });
    await client.send({
      from: { email: fromEmail, name: fromName },
      to: [{ email: destinatario }],
      subject: "Redefinição de senha — WAPI",
      text: `Recebemos uma solicitação para redefinir sua senha. Acesse: ${link}\n\nEste link expira em 30 minutos. Se você não solicitou, ignore esta mensagem.`,
      html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#0a3560;color:white;text-decoration:none;border-radius:6px">Redefinir minha senha</a></p><p>Este link expira em 30 minutos. Se você não solicitou, ignore esta mensagem.</p><p>Se o botão não funcionar, copie este endereço:<br><a href="${link}">${link}</a></p>`,
      category: "Redefinição de senha",
    });
  }

  return { enviarLinkRedefinicao };
}
