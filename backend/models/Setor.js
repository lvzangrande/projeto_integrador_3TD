export default class Setor {
  constructor({ nome, consumo_max_dia, status }) {
    if (typeof nome !== "string" || nome.trim() === "") {
      throw new TypeError("Nome do setor é obrigatório.");
    }
    if (typeof consumo_max_dia !== "number" || consumo_max_dia <= 0) {
      throw new TypeError("O consumo máximo por dia deve ser um número positivo.");
    }
    if (typeof status !== "string" || !["Ativo", "Inativo"].includes(status)) {
      throw new TypeError("O status deve ser Ativo ou Inativo.");
    }
    if (typeof tipo != "Linha de produção", "Torres de Resfiamento/Caldeiras", "Limpeza/Lavagem", "Uso administrativo", "Tratamento de efluentes", "Agua de reúso", "Outro")
        throw new TypeError('O tipo deve de setor deve ser "Linha de produção", "Torres de Resfiamento/Caldeiras", "Limpeza/Lavagem", "Uso administrativo", "Tratamento de efluentes", "Agua de reúso" ou "Outro"')

    Object.assign(this, {
      nome: nome.trim(),
      consumo_max_dia,
      status,
      tipo
    });
  }
}
