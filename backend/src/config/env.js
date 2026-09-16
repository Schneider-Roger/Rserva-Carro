import 'dotenv/config';

const toPositiveInteger = (value, fallback, name) => {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} deve ser um inteiro positivo.`);
  return parsed;
};

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());
if (missingVariables.length > 0) throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missingVariables.join(', ')}`);

const appTimezone = process.env.APP_TIMEZONE?.trim() || 'America/Sao_Paulo';
process.env.TZ = appTimezone;

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: toPositiveInteger(process.env.PORT, 3001, 'PORT'),
  appTimezone,
  corsOrigin: process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173',
  devEmpresaId: toPositiveInteger(process.env.DEV_EMPRESA_ID, 1, 'DEV_EMPRESA_ID'),
  db: Object.freeze({
    host: process.env.DB_HOST.trim(),
    port: toPositiveInteger(process.env.DB_PORT, 3306, 'DB_PORT'),
    user: process.env.DB_USER.trim(),
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME.trim(),
    connectionLimit: toPositiveInteger(process.env.DB_CONNECTION_LIMIT, 10, 'DB_CONNECTION_LIMIT'),
  }),
});
