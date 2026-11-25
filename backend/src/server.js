import "dotenv/config";
import { pool, checkDatabaseConnection } from "./config/database.js";
import { garantirEsquemaAdministrativo } from "./config/adminSchema.js";
import app from "./app.js";

const port = Number(process.env.PORT || 8080);

try {
  await checkDatabaseConnection();
  await garantirEsquemaAdministrativo(pool);
  app.listen(port, () => {
    console.log(`API disponivel em http://localhost:${port}`);
  });
} catch (erro) {
  console.error("Não foi possível iniciar a API; verifique a conexão MySQL e as configurações do servidor.");
  console.error(`Código do erro: ${erro.code || "desconhecido"}`);
  await pool.end();
  process.exit(1);
}
