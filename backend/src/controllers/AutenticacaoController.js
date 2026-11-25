import { limparCookieSessao, definirCookieSessao } from "../middlewares/auth.js";

export function criarAutenticacaoController({ autenticacaoService, recuperacaoSenhaService }) {
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

  async function solicitarRedefinicao(request, response, next) {
    try {
      const dados = await recuperacaoSenhaService.solicitarRedefinicao(request.body?.cpf, request.ip);
      response.status(202).json({ sucesso: true, dados });
    } catch (erro) {
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  async function redefinirSenha(request, response, next) {
    try {
      const dados = await recuperacaoSenhaService.redefinirSenha(request.body ?? {});
      response.status(200).json({ sucesso: true, dados });
    } catch (erro) {
      if (erro.status) return response.status(erro.status).json({ erro: erro.message });
      next(erro);
    }
  }

  return { entrar, sair, atual, solicitarRedefinicao, redefinirSenha };
}
