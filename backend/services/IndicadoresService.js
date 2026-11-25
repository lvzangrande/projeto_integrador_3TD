const DIA_MS = 24 * 60 * 60 * 1000;
const JANELA_LEITURA_DIAS = 7;
const INTERVALO_MAXIMO_DIAS = 30;

function formatarDataHoraSaoPaulo(data) {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(data);
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day} ${valores.hour}:${valores.minute}:${valores.second}`;
}

function converterDataHoraLocal(value) {
  if (!value) return Number.NaN;
  return Date.parse(`${value.replace(" ", "T")}-03:00`);
}

function estimarConsumoDiario(leituras, agoraMs) {
  const ordenadas = leituras
    .filter((leitura) => leitura.momento_leitura)
    .sort((a, b) => a.momento_leitura.localeCompare(b.momento_leitura) || Number(a.id_leitura) - Number(b.id_leitura));
  if (ordenadas.length < 2) return null;

  const atual = ordenadas[ordenadas.length - 1];
  const anterior = ordenadas[ordenadas.length - 2];
  const momentoAtualMs = converterDataHoraLocal(atual.momento_leitura);
  const momentoAnteriorMs = converterDataHoraLocal(anterior.momento_leitura);
  const intervaloMs = momentoAtualMs - momentoAnteriorMs;
  const idadeAtualMs = agoraMs - momentoAtualMs;
  const valorAtual = Number(atual.volume_leitura);
  const valorAnterior = Number(anterior.volume_leitura);

  if (
    !Number.isFinite(intervaloMs)
    || intervaloMs <= 0
    || intervaloMs > INTERVALO_MAXIMO_DIAS * DIA_MS
    || idadeAtualMs < 0
    || idadeAtualMs > JANELA_LEITURA_DIAS * DIA_MS
    || !Number.isFinite(valorAtual)
    || !Number.isFinite(valorAnterior)
    || valorAtual < valorAnterior
  ) {
    return null;
  }

  return (valorAtual - valorAnterior) / (intervaloMs / DIA_MS);
}

export function criarIndicadoresService({ indicadoresModel }) {
  async function litrosPoupadosPorDia() {
    const agora = new Date();
    const agoraMs = agora.getTime();
    const desde = formatarDataHoraSaoPaulo(new Date(agoraMs - (JANELA_LEITURA_DIAS + INTERVALO_MAXIMO_DIAS) * DIA_MS));
    const linhas = await indicadoresModel.leiturasParaEstimativa({ desde });
    const setores = new Map();

    for (const linha of linhas) {
      if (!setores.has(linha.id_setor)) {
        setores.set(linha.id_setor, {
          limiteDiario: Number(linha.consumo_max_dia),
          medidores: new Map(),
        });
      }
      const setor = setores.get(linha.id_setor);
      if (!setor.medidores.has(linha.id_med)) setor.medidores.set(linha.id_med, []);
      if (linha.id_leitura !== null) setor.medidores.get(linha.id_med).push(linha);
    }

    let estimativaTotal = 0;
    let setoresCalculados = 0;
    for (const setor of setores.values()) {
      const consumos = [...setor.medidores.values()].map((leituras) => estimarConsumoDiario(leituras, agoraMs));
      if (consumos.length === 0 || consumos.some((consumo) => consumo === null) || !Number.isFinite(setor.limiteDiario)) continue;

      const consumoDiario = consumos.reduce((total, consumo) => total + consumo, 0);
      estimativaTotal += Math.max(0, setor.limiteDiario - consumoDiario);
      setoresCalculados += 1;
    }

    return setoresCalculados > 0 ? Number(estimativaTotal.toFixed(3)) : null;
  }

  return { litrosPoupadosPorDia };
}
