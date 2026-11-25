export function criarIndicadoresController({ indicadoresService }) {
  async function aguaPoupada(_request, response, next) {
    try {
      const litrosPorDia = await indicadoresService.litrosPoupadosPorDia();
      return response.status(200).json({ sucesso: true, dados: { litros_por_dia: litrosPorDia } });
    } catch (error) {
      return next(error);
    }
  }

  return { aguaPoupada };
}
