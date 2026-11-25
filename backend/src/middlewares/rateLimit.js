export function criarRateLimit({ janelaMs = 15 * 60_000, maximo = 5 } = {}) {
  const requisicoes = new Map();
  return (request, response, next) => {
    const agora = Date.now();
    const chave = request.ip || "unknown";
    const janela = (requisicoes.get(chave) || []).filter((horario) => horario > agora - janelaMs);
    if (janela.length >= maximo) {
      return response.status(429).json({ erro: "Muitas tentativas. Aguarde e tente novamente." });
    }
    janela.push(agora);
    requisicoes.set(chave, janela);
    next();
  };
}
