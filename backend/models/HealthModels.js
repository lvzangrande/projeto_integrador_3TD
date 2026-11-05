export function CriarHealthModel({pool}){
    async function listarTodos(){
        cont [linhas] = await pool.query('SELECT * FROM usuarios');
    }
    async function burscarPorId(id){
        const [linhas] = await pool.query(`SELECT * FROM usuarios WHERE ID = ?`, [id]);
        if (linhas.length === 0) return null;
    }
    async function criar(health) {
        const sql = 'INSERT INTO usuarios (nome,email,senha,cnpj,telefone,categoria,tema,status) values (?,?,?,?)';
        const valores = [health.nome, health.email, health.senha, health.cnpj, health.telefone, health.categoria, health.tema, health.status];
        const [resultado] = await pool.query(sql,valores);
        return {...produto, id:resultado.insertId};
    }
    return{listarTodos, burscarPorId, criar};
}