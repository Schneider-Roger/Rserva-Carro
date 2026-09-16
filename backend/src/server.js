import { app } from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';

let server;
let shuttingDown = false;

async function start() {
  await pool.query('SELECT 1');

  server = app.listen(env.port, () => {
    console.log(`Frota Leve API executando na porta ${env.port}.`);
  });
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`${signal} recebido. Encerrando API...`);

  const finish = async () => {
    try {
      await pool.end();
    } finally {
      process.exit(0);
    }
  };

  if (!server) {
    await finish();
    return;
  }

  server.close(finish);

  setTimeout(() => {
    console.error('Encerramento forçado após timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch(async (error) => {
  console.error('Falha ao iniciar a API:', error);

  try {
    await pool.end();
  } finally {
    process.exit(1);
  }
});
