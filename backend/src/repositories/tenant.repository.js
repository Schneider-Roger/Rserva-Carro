import { pool } from '../config/db.js';

const defaultSettings = Object.freeze({
  timezone: 'America/Sao_Paulo',
  intervalo_reserva_minutos: 30,
  antecedencia_minima_minutos: 0,
  antecedencia_cancelamento_minutos: 0,
  max_destinos: 10,
  permite_motorista_diferente: true,
  exige_numero_chamado: false,
  exige_centro_custo: false,
  permite_edicao_reserva: true,
  permite_cancelamento: true,
});

export async function getTenantSettings(empresaId, executor = pool) {
  const [rows] = await executor.execute(`
    SELECT timezone, intervalo_reserva_minutos, antecedencia_minima_minutos,
           antecedencia_cancelamento_minutos, max_destinos, permite_motorista_diferente,
           exige_numero_chamado, exige_centro_custo, permite_edicao_reserva, permite_cancelamento
      FROM empresa_configuracoes
     WHERE empresa_id = ?
     LIMIT 1
  `, [empresaId]);
  return { ...defaultSettings, ...(rows[0] || {}) };
}

export async function getTenantContext(empresaId, userId) {
  const [[userRows], [brandingRows]] = await Promise.all([
    pool.execute(`
      SELECT u.id, u.codigo_funcionario, u.nome, u.email, u.telefone,
             un.id AS unidade_id, un.nome AS unidade_nome,
             d.id AS departamento_id, d.nome AS departamento_nome
        FROM usuarios u
        LEFT JOIN unidades un ON un.empresa_id = u.empresa_id AND un.id = u.unidade_id
        LEFT JOIN departamentos d ON d.empresa_id = u.empresa_id AND d.id = u.departamento_id
       WHERE u.empresa_id = ? AND u.id = ? AND u.ativo = TRUE
       LIMIT 1
    `, [empresaId, userId]),
    pool.execute(`
      SELECT nome_produto, logo_url, favicon_url, cor_primaria, cor_secundaria,
             email_suporte, exibir_marca_plataforma
        FROM empresa_branding
       WHERE empresa_id = ?
       LIMIT 1
    `, [empresaId]),
  ]);

  return {
    user: userRows[0] || null,
    branding: brandingRows[0] || null,
    settings: await getTenantSettings(empresaId),
  };
}
