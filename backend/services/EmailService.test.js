import test from "node:test";
import assert from "node:assert/strict";
import { criarEmailService } from "./EmailService.js";

function criarNodemailerFake() {
  const fake = { config: null, mensagens: [], verifyCalls: 0 };
  fake.createTransport = (config) => {
    fake.config = config;
    return {
      verify: async () => { fake.verifyCalls += 1; return true; },
      sendMail: async (message) => { fake.mensagens.push(message); return { accepted: [message.to] }; },
    };
  };
  return fake;
}

test("cria transporte Gmail e envia para o destinatário dinâmico", async () => {
  const mailer = criarNodemailerFake();
  const service = criarEmailService({
    env: { GMAIL_USER: "wapicontrolcontact@gmail.com", GMAIL_APP_PASSWORD: "senha de aplicativo", MAIL_FROM_NAME: "WAPI" },
    nodemailerModule: mailer,
  });

  assert.deepEqual(mailer.config, {
    service: "gmail",
    auth: { user: "wapicontrolcontact@gmail.com", pass: "senhadeaplicativo" },
  });
  await service.enviarLinkRedefinicao({ destinatario: "teste@outlook.com", link: "https://wapi.example/reset?token=x" });
  assert.equal(mailer.mensagens[0].to, "teste@outlook.com");
  assert.equal(mailer.mensagens[0].from.address, "wapicontrolcontact@gmail.com");
  assert.match(mailer.mensagens[0].html, /#0a3560/);
  assert.match(mailer.mensagens[0].text, /30 minutos/);
});

test("verificarConexao delega ao transporter.verify", async () => {
  const mailer = criarNodemailerFake();
  const service = criarEmailService({ env: { GMAIL_USER: "wapicontrolcontact@gmail.com", GMAIL_APP_PASSWORD: "app-password" }, nodemailerModule: mailer });
  assert.equal(await service.verificarConexao(), true);
  assert.equal(mailer.verifyCalls, 1);
});

test("valida as credenciais sem revelar valores ausentes", () => {
  assert.throws(() => criarEmailService({ env: { GMAIL_USER: "wapicontrolcontact@gmail.com" }, nodemailerModule: criarNodemailerFake() }), /GMAIL_USER e GMAIL_APP_PASSWORD/);
});
