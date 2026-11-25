const TWILIO_VERIFY_URL = "https://verify.twilio.com/v2/Services";

function obterCodigoErro(payload) {
  return typeof payload?.code === "number" || typeof payload?.code === "string"
    ? String(payload.code)
    : null;
}

export function criarSmsService({ env = process.env, fetchImpl = fetch } = {}) {
  function validarConfiguracao() {
    const campos = ["TWILIO_API_KEY_SID", "TWILIO_API_KEY_SECRET", "TWILIO_VERIFY_SERVICE_SID"];
    const ausentes = campos.filter((campo) => !env[campo]?.trim());
    if (ausentes.length) {
      throw Object.assign(
        new Error(`Configure no backend/.env as variáveis: ${ausentes.join(", ")}.`),
        { status: 503 },
      );
    }

    if (!/^SK[\da-f]{32}$/i.test(env.TWILIO_API_KEY_SID.trim())) {
      throw Object.assign(new Error("TWILIO_API_KEY_SID não tem um formato válido."), { status: 503 });
    }
    if (!/^VA[\da-f]{32}$/i.test(env.TWILIO_VERIFY_SERVICE_SID.trim())) {
      throw Object.assign(new Error("TWILIO_VERIFY_SERVICE_SID não tem um formato válido."), { status: 503 });
    }
  }

  async function postar(recurso, parametros) {
    validarConfiguracao();
    const apiKeySid = env.TWILIO_API_KEY_SID.trim();
    const segredo = env.TWILIO_API_KEY_SECRET.trim();
    const serviceSid = env.TWILIO_VERIFY_SERVICE_SID.trim();
    const auth = Buffer.from(`${apiKeySid}:${segredo}`).toString("base64");
    const response = await fetchImpl(`${TWILIO_VERIFY_URL}/${serviceSid}/${recurso}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(parametros),
      signal: AbortSignal.timeout(10_000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const codigoErro = obterCodigoErro(payload);
      const detalhe = codigoErro ? `, código ${codigoErro}` : "";
      throw Object.assign(
        new Error(`Twilio Verify recusou a solicitação (HTTP ${response.status}${detalhe}).`),
        { httpStatus: response.status, twilioCode: codigoErro },
      );
    }
    return payload;
  }

  async function enviarCodigo({ destinatario }) {
    const resposta = await postar("Verifications", { To: destinatario, Channel: "sms" });
    if (resposta.status !== "pending") {
      throw new Error("Twilio Verify não iniciou a verificação por SMS.");
    }
  }

  async function validarCodigo({ destinatario, codigo }) {
    try {
      const resposta = await postar("VerificationCheck", { To: destinatario, Code: codigo });
      return resposta.status === "approved" && resposta.valid === true;
    } catch (erro) {
      // O Verify apaga verificações expiradas ou que atingem o limite de tentativas.
      if (erro.httpStatus === 404 || erro.twilioCode === "60202") return false;
      throw erro;
    }
  }

  return { validarConfiguracao, enviarCodigo, validarCodigo };
}
