import "dotenv/config";
import { pool, checkDatabaseConnection } from "./config/database.js";
import app from "./app.js";

const port = Number(process.env.PORT || 8080);

try {
  await checkDatabaseConnection();
  app.listen(port, () => {
    console.log(`API disponivel em http://localhost:${port}`);
  });
} catch (erro) {
  console.error("Não foi possível conectar ao MySQL.");
  console.error(`Código do erro: ${erro.code || "desconhecido"}`);
  await pool.end();
  process.exit(1);
}
