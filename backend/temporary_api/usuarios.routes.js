const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const router = express.Router();

const CATEGORIAS = ['Admin', 'Filiado', 'Cliente'];
const TEMAS = ['Claro', 'Escuro'];
const STATUS = ['Ativo', 'Inativo'];

const CAMPOS = 'id_usuario, nome, email, cnpj, telefone, categoria, tema, status';

function validar(body, { parcial = false } = {}) {
  const obrigatorios = ['nome', 'email', 'senha', 'cnpj'];
  if (!parcial) {
    for (const campo of obrigatorios) {
      if (!body[campo]) return `O campo "${campo}" é obrigatório.`;
    }
  }
  if (body.nome && body.nome.length > 100) return 'Nome deve ter até 100 caracteres.';
  if (body.email && body.email.length > 100) return 'E-mail deve ter até 100 caracteres.';
  if (body.cnpj && body.cnpj.length > 20) return 'CNPJ deve ter até 20 caracteres.';
  if (body.telefone && body.telefone.length > 20) return 'Telefone deve ter até 20 caracteres.';
  if (body.categoria && !CATEGORIAS.includes(body.categoria))
    return `Categoria inválida. Use: ${CATEGORIAS.join(', ')}.`;
  if (body.tema && !TEMAS.includes(body.tema)) return `Tema inválido. Use: ${TEMAS.join(', ')}.`;
  if (body.status && !STATUS.includes(body.status)) return `Status inválido. Use: ${STATUS.join(', ')}.`;
  return null;
}

router.get('/', async (req, res, next) => {
  try {
    const filtros = [];
    const valores = [];
    for (const campo of ['status', 'categoria', 'tema']) {
      if (req.query[campo]) {
        filtros.push(`${campo} = ?`);
        valores.push(req.query[campo]);
      }
    }
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT ${CAMPOS} FROM usuarios ${where} ORDER BY id_usuario`, valores);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT ${CAMPOS} FROM usuarios WHERE id_usuario = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const erro = validar(req.body);
    if (erro) return res.status(400).json({ erro });

    const { nome, email, senha, cnpj, telefone = null, categoria, tema, status } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);

    const colunas = ['nome', 'email', 'senha', 'cnpj', 'telefone'];
    const valores = [nome, email, senhaHash, cnpj, telefone];
    if (categoria) { colunas.push('categoria'); valores.push(categoria); }
    if (tema) { colunas.push('tema'); valores.push(tema); }
    if (status) { colunas.push('status'); valores.push(status); }

    const [result] = await pool.query(
      `INSERT INTO usuarios (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
      valores
    );
    const [rows] = await pool.query(`SELECT ${CAMPOS} FROM usuarios WHERE id_usuario = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const erro = validar(req.body, { parcial: true });
    if (erro) return res.status(400).json({ erro });

    const permitidos = ['nome', 'email', 'senha', 'cnpj', 'telefone', 'categoria', 'tema', 'status'];
    const sets = [];
    const valores = [];

    for (const campo of permitidos) {
      if (req.body[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        valores.push(campo === 'senha' ? await bcrypt.hash(req.body.senha, 10) : req.body[campo]);
      }
    }
    if (!sets.length) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });

    valores.push(req.params.id);
    const [result] = await pool.query(`UPDATE usuarios SET ${sets.join(', ')} WHERE id_usuario = ?`, valores);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const [rows] = await pool.query(`SELECT ${CAMPOS} FROM usuarios WHERE id_usuario = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = rows[0];
    const senhaOk = usuario && (await bcrypt.compare(senha, usuario.senha));
    if (!senhaOk) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    if (usuario.status !== 'Ativo') return res.status(403).json({ erro: 'Usuário inativo.' });

    delete usuario.senha;
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
