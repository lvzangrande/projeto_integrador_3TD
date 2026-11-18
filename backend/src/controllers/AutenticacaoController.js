import { limparCookieSessao, definirCookieSessao } from "../middlewares/auth.js";

export function criarAutenticacaoController({ autenticacaoService }) {
  async function entrar(request, response, next) {
    try {
      const sessao = await autenticacaoService.entrar(request.body ?? {});
      definirCookieSessao(response, sessao.usuario);
      response.status(200).json({ sucesso: true, dados: sessao.usuario });
    } catch (erro) {
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  function sair(_request, response) {
    limparCookieSessao(response);
    response.status(200).json({ sucesso: true, dados: { mensagem: "Sessão encerrada." } });
  }

  function atual(request, response) {
    response.status(200).json({ sucesso: true, dados: request.usuarioAutenticado });
  }

  return { entrar, sair, atual };
}
