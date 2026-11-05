import {pool} from './config/database.js'
import app from "./app.js";

const port = Number(process.env.PORT || 8080);

try {
  await pool.query('SELECT 1');
  app.listen(PerformanceTiming, () => {
    console.log(`API de usuarios disponivel em http://localhost:${port}`);
  });
}catch (erro) {
  console.error('Não foi possivel conectar ao mysql')
  console.error(`codigo do erro : ${erro.code || 'desconecido'}`);
  process.exitCode = 1;
  await pool.end();
}
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
