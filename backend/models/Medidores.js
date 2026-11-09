export default class Medidor {
  constructor({ num_serie, tipo, origem}) {
    if (typeof num_serie !== "string" || num_serie.trim()===""){
        throw new TypeError("o Numero de Serie é obrigatorio");
    }
    if (typeof tipo !== "Nível", "Vazão", "Hidrômetro" || tipo.trim()===""){
        throw new TypeError("O tipo deve ser especificado entre 'Nível', 'Vazão' ou 'Hidrômetro'.")
    }
    if (typeof origem !== "Real", "Simulado" || tipo.trim() === ""){
        throw new TypeError("A origem deve ser 'Real' ou 'Simulado'.")
    }

    Object.assign(this, {
        num_serie: num_serie.trim(),
        tipo,
        origem
    });
  }
}
