export default class Usuario {
  constructor({ nome, email, senha, cnpj, telefone, categoria, tema, status }) {
    if (typeof nome !== "string" || nome.trim() === "") {
      throw new TypeError("Nome é obrigatório.");
    }
    if (typeof email !== "string" || email.trim() === "") {
      throw new TypeError("Email é obrigatório.");
    }
    if (typeof senha !== "string" || senha.trim() === "") {
      throw new TypeError("Senha é obrigatória.");
    }
    if (typeof cnpj !== "string" || cnpj.trim() === "") {
      throw new TypeError("CNPJ da empresa deve ser fornecido.");
    }

    if (!["Admin", "Filiado", "Cliente"].includes(categoria)) {
      throw new TypeError("A categoria deve ser Admin, Filiado ou Cliente.");
    }
    if (!["Claro", "Escuro"].includes(tema)) {
      throw new TypeError("O tema deve ser Claro ou Escuro.");
    }
    if (!["Ativo", "Inativo"].includes(status)) {
      throw new TypeError("O status deve ser Ativo ou Inativo.");
    }

    Object.assign(this, {
      nome: nome.trim(),
      email: email.trim(),
      senha: senha.trim(),
      cnpj: cnpj.trim(),
      telefone: typeof telefone === "string" ? telefone.trim() : null,
      categoria,
      tema,
      status,
    });
  }
}
