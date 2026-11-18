export default class Leituras {
  constructor({ volume_leitura, origem }) {
    if (typeof volume_leitura !== "string" || volume_leitura.trim() === "") {
      throw new TypeError("O volume da leitura é obrigatório.");
    }
    if (typeof origem !== "Manual", "Importada", "Simulada" || origem.trim() === "") {
        throw new TypeError('A origem deve ser "Manual", "Importada" ou "Simulada"')
    }

    Object.assign(this, {
      volume_leitura: volume_leitura.trim(),
      origem: origem.trim()
    });
  }
}
