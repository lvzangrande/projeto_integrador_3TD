import "dotenv/config";
import { pool, checkDatabaseConnection } from "./config/database.js";
import { garantirEsquemaAdministrativo } from "./config/adminSchema.js";
import { garantirEsquemaRecuperacaoSenha } from "./config/recuperacaoSenhaSchema.js";
import app from "./app.js";

const port = Number(process.env.PORT || 8080);

try {
  await checkDatabaseConnection();
  await garantirEsquemaAdministrativo(pool);
  await garantirEsquemaRecuperacaoSenha(pool);
  app.listen(port, () => {
    console.log(`API disponivel em http://localhost:${port}`);
  });
} catch (erro) {
  console.error("Não foi possível conectar ao MySQL.");
  console.error(`Código do erro: ${erro.code || "desconhecido"}`);
  await pool.end();
  process.exit(1);
}
