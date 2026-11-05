require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const usuariosRoutes = require('./usuarios.routes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', banco: 'ok' });
  } catch (err) {
    res.status(500).json({ api: 'ok', banco: 'falhou', detalhe: err.code || err.message });
  }
});

app.use('/usuarios', usuariosRoutes);

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um usuário com este e-mail.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
