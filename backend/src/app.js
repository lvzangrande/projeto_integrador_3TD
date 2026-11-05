import cors from "cors";
import express from "express";
import helmet from "helmet";
import { resolve } from "node:path";

import { errorHandler } from "./middlewares/errorHandler.js";
import {criarPool} from './config/database.js'
	
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use((req,res)=> {
  res.status(404).json({erro: `A rota ${req.method} ${req.originalUrl} nao existe.`});
});

app.use((erro, _req, res, _next) => {
  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({ erro: 'O corpo da requisição deve conter um JSON válido.' });
  }
  if (erro.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um registro com esse nome, e-mail, CPF ou CNPJ.' });
  }
  if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ erro: 'Este registro possui vendas vinculadas e não pode ser excluído.' });
  }
  console.error('Erro na API de produtos:', erro);
  return res.status(500).json({ erro: 'Falha ao acessar o banco de dados. Verifique a conexão e as migrações.' });
});

app.use(errorHandler);

export default app;
