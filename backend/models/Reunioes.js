export default class Reunioes {
  constructor({ pauta,resumo,proximos_passos,tipo}) {
    if (typeof pauta !== "string" || nome.trim() === "") {
      throw new TypeError("Definir a Pauta é obrigatório.");
    }
    if (typeof resumo !== "string" || resumo.trim() === "") {
        throw new TypeError("O Resumo é obrigatorio");
    }
    if (typeof proximos_passos !== "string" || proximos_passos.trim() === ""){
        throw new TypeError("Os Proximos_passos devem ser definidos");
    }
    if (typeof tipo !== "Reunião","Entrevista" || tipo.trim()===""){
        throw new TypeError("O tipo deve ser 'Reunião' ou 'Entrevista'");
    }

    Object.assign(this, {
        pauta: pauta.trim(),
        resumo: resumo.trim(),
        proximos_passos:proximos_passos.trim(),
        tipo
    });
  }
}
