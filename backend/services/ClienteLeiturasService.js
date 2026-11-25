function erroValidacao(message) {
  return Object.assign(new TypeError(message), { statusCode: 400 });
}

function dataHoraAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day} ${valores.hour}:${valores.minute}:${valores.second}`;
}

function validarMomento(value) {
  if (typeof value !== "string") throw erroValidacao("Informe a data e a hora da leitura.");
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!partes) throw erroValidacao("A data e hora da leitura estão em formato inválido.");

  const [, ano, mes, dia, hora, minuto, segundo = "00"] = partes;
  const dataUtc = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo)));
  if (
    Number(ano) < 1000
    || dataUtc.getUTCFullYear() !== Number(ano)
    || dataUtc.getUTCMonth() !== Number(mes) - 1
    || dataUtc.getUTCDate() !== Number(dia)
    || Number(hora) > 23
    || Number(minuto) > 59
    || Number(segundo) > 59
  ) {
    throw erroValidacao("Informe uma data e hora válidas.");
  }

  const momento = `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
  if (momento > dataHoraAtualSaoPaulo()) {
    throw erroValidacao("A data da leitura não pode estar no futuro.");
  }
  return momento;
}

function validarVolume(value) {
  const texto = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,3})?$/.test(texto)) {
    throw erroValidacao("Informe um valor não negativo com até três casas decimais.");
  }
  const numero = Number(texto);
  if (!Number.isFinite(numero) || numero > 999999999999.999) {
    throw erroValidacao("O valor da leitura está fora do limite permitido.");
  }
  return numero.toFixed(3);
}

export function criarClienteLeiturasService({ clienteLeiturasModel }) {
  async function registrarManual(dados) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
      throw erroValidacao("Envie os dados da leitura.");
    }
    const permitidos = new Set(["id_usuario", "id_med", "volume_leitura", "momento_leitura"]);
    if (Object.keys(dados).some((campo) => !permitidos.has(campo))) {
      throw erroValidacao("A leitura contém campos não permitidos.");
    }

    const id_usuario = Number(dados.id_usuario);
    const idMedidorValido = typeof dados.id_med === "number"
      ? Number.isSafeInteger(dados.id_med) && dados.id_med > 0
      : typeof dados.id_med === "string" && /^[1-9]\d*$/.test(dados.id_med) && Number.isSafeInteger(Number(dados.id_med));
    const id_med = Number(dados.id_med);
    if (!Number.isSafeInteger(id_usuario) || id_usuario <= 0 || !idMedidorValido) {
      throw erroValidacao("Selecione um medidor válido.");
    }

    return clienteLeiturasModel.registrarManual({
      id_usuario,
      id_med,
      volume_leitura: validarVolume(dados.volume_leitura),
      momento_leitura: validarMomento(dados.momento_leitura),
    });
  }

  return { registrarManual };
}
