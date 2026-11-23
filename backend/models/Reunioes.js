<<<<<<< HEAD
const TIPOS = ["Reunião", "Entrevista"];
=======
const TIPOS = ["Reuni\u00e3o", "Entrevista"];
>>>>>>> main

export default class Reuniao {
  constructor({ id_usuario, id_filiado, momento_abertura, pauta, resumo, proximos_passos, tipo }) {
    if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
      throw new TypeError("Selecione um cliente válido.");
    }
    if (!Number.isInteger(Number(id_filiado)) || Number(id_filiado) <= 0) {
      throw new TypeError("Filiado inválido.");
    }
    if (typeof momento_abertura !== "string" || !momento_abertura.trim()) {
      throw new TypeError("Informe a data e o horário do encontro.");
    }
    if (typeof pauta !== "string" || !pauta.trim()) throw new TypeError("Informe a pauta.");
    if (typeof resumo !== "string" || !resumo.trim()) throw new TypeError("Informe o resumo do encontro.");
    if (proximos_passos != null && typeof proximos_passos !== "string") {
      throw new TypeError("Os próximos passos são inválidos.");
    }
    if (!TIPOS.includes(tipo)) throw new TypeError("O tipo deve ser Reunião ou Entrevista.");

    Object.assign(this, {
      id_usuario: Number(id_usuario),
      id_filiado: Number(id_filiado),
      momento_abertura: momento_abertura.trim().replace("T", " "),
      pauta: pauta.trim(),
      resumo: resumo.trim(),
      proximos_passos: proximos_passos?.trim() || null,
      tipo,
    });
  }
}
