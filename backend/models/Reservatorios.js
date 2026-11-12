export default class Reservatorios{
  constructor({ nome, capacidade, localizacao, nivel_min, nivel_max, status, tipo  }) {
    if (typeof nome !== "string" || nome.trim() === "") {
      throw new TypeError("O Nome do reservatorio é obrigatório.");
    }
    if (typeof capacidade !== "number" || capacidade.trim() === "") {
        throw new TypeError("A capacidade deve ser informada em Litros");
    }
    if (typeof localizacao !== "string" || localizacao.trim() === "") {
        throw new TypeError("A localização deve ser especificada");
    }
    if (typeof nivel_min !== "number") {
        throw new TypeError("O nivel minimo deve ser dito");
    }
    if (typeof nivel_max !== "number"){
        throw new TypeError("O nivel maximo deve ser dito");
    }
    if (typeof status !== "Ativo", "Inativo"){
        throw new TypeError("O status deve ser 'Ativo' ou 'Inativo' ");
    }
    if (typeof tipo !== "Torre de resfriamento", "Tanque de processo", "Decantador", "Reservatório de água bruta","Reservatório de agua tratada", "Cisterna", "Tanque elevado", "Outro" ){
        throw new TypeError('O tipo deve estar entre "Torre de resfriamento", "Tanque de processo", "Decantador", "Reservatório de água bruta","Reservatório de agua tratada", "Cisterna", "Tanque elevado" ou "Outro"')
    }

    Object.assign(this, {
        nome: nome.trim(),
        capacidade,
        localizacao,
        nivel_min,
        nivel_max,
        status,
        tipo
    });
  }
}
