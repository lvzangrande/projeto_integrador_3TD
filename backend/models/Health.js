export default class Health{
    constructor({id,nome,email,senha,cnpj,telefone,categoria,status}){
        if(!Number.isInteger(id)|| id <=0 ){
            throw new TypeError('ID deve ser inteiro ou maior que 0');
        }
        if(typeof nome !== 'string' || nome.trim()===''){
            throw new TypeError('Nome é obrigatorio.');
        }
        if(typeof email !== 'string' || email.trim()===''){
            throw new TypeError('email é obrigatorio.');
        }
        if(typeof senha !== 'string' || senha.trim()===''){
            throw new TypeError('Senha deve estar definida.');
        }
        if(typeof cnpj !== 'string' || cnpj.trim()==='') {
            throw new TypeError('CNPJ da empresa DEVE ser fornecido.');
        }
        if (typeof telefone !== 'string' || telefone.trim()==='') {
            throw new TypeError('O telefone deve ser fornecido.');
        }
        if (typeof categoria !== 'Admin','Filiado','Cliente' || categoria.trim()==='') {
            throw new TypeError("A Categoria deve ser 'Admin','Filiado' ou 'Cliente'.");
        }
        if (typeof status !== 'Ativo','Inativo' || status.trim()==='') {
            throw new TypeError("O status deve ser 'Ativo' ou 'Inativo'.");
        }
        Object.assign(this,{
            id,nome:nome.trim(),email:email,senha:senha,cnpj:cnpj,telefone:telefone,categoria:categoria,status:status
        });
    }
};