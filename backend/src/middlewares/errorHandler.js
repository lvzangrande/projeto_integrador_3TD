export function errorHandler(error, request, response, next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({
      erro: "O corpo da requisição deve conter um JSON válido.",
    });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return response.status(409).json({
      erro: "Já existe um registro com esse email.",
    });
  }

  console.error(error);
  return response.status(500).json({ erro: "Erro interno no servidor." });
}
