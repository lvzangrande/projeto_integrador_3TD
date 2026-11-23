import { limparCookieSessao, definirCookieSessao } from "../middlewares/auth.js";

export function criarAutenticacaoController({ autenticacaoService }) {
  async function entrar(request, response, next) {
    try {
      const sessao = await autenticacaoService.entrar(request.body ?? {}, { ip: request.ip });
      definirCookieSessao(response, sessao.usuario);
      response.status(200).json({ sucesso: true, dados: sessao.usuario });
    } catch (erro) {
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  async function sair(request, response, next) {
    try {
      await autenticacaoService.registrarSaida(request.usuarioAutenticado, request.ip);
      limparCookieSessao(response);
      response.status(200).json({ sucesso: true, dados: { mensagem: "Sessão encerrada." } });
    } catch (erro) {
      next(erro);
    }
  }

  function atual(request, response) {
    response.status(200).json({ sucesso: true, dados: request.usuarioAutenticado });
  }

  return { entrar, sair, atual };
}
