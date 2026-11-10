export default class Ocorrencias {
  constructor({ descricao, volume_perdido, status, severidade, tipo}) {
    if (typeof descricao !== "string" || descricao.trim()=== ""){
        throw new TypeError ("A Descrição é obrigatoria")
    }
    if (typeof volume_perdido !== "string" || volume_perdido.trim() === "") {
      throw new TypeError("Citar o Volume perdido é obrigatório.");
    }
    if (typeof severidade !== "Baixa","Média","Extrema" || severidade.trim() === "") {
      throw new TypeError("A severidade é Obrigatoria.");
    }

    if (!["Vazamento visível","Vazamento Oculto", "Consumo anormal", "Falha de sensor", "Transbordo", "Outro"].includes(tipo)) {
      throw new TypeError('O tipo deve ser "Vazamento visível","Vazamento Oculto", "Consumo anormal", "Falha de sensor", "Transbordo", "Outro"');
    }
    if (!["Aberta","Em análise", "Em reparo", "Resolvida", "Descartada" ].includes(status)) {
      throw new TypeError('O status deve ser "Aberta","Em análise", "Em reparo", "Resolvida" ou "Descartada" ');
    }+

    Object.assign(this, {
      descricao: descricao.trim(),
      volume_perdido,
      severidade,
      tipo,
      status
    });
  }
}
