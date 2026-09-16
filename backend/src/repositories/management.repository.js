import { pool } from '../config/db.js';

export async function getManagementSummary(empresaId) {
  const connection = await pool.getConnection();
  try {
    const [[fleet]] = await connection.query(`SELECT COUNT(*) AS total, SUM(ativo = TRUE AND status_operacional = 'DISPONIVEL') AS disponiveis, SUM(ativo = TRUE AND status_operacional = 'MANUTENCAO') AS manutencao, SUM(ativo = TRUE AND status_operacional = 'BLOQUEADO') AS bloqueados FROM veiculos WHERE empresa_id = ?`, [empresaId]);
    const [[month]] = await connection.query(`SELECT COUNT(*) AS viagens, COALESCE(SUM(GREATEST(0, ov.km_final - ov.km_inicial)), 0) AS km FROM operacoes_veiculo ov WHERE ov.empresa_id = ? AND ov.status = 'DEVOLVIDA' AND ov.devolvido_em >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')`, [empresaId]);
    const [[fuel]] = await connection.query(`SELECT COALESCE(SUM(valor_total), 0) AS total FROM abastecimentos WHERE empresa_id = ? AND status = 'ATIVO' AND data_hora >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')`, [empresaId]);
    const [[maintenance]] = await connection.query(`SELECT COALESCE(SUM(custo_total), 0) AS total FROM manutencoes WHERE empresa_id = ? AND criado_em >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01') AND status <> 'CANCELADA'`, [empresaId]);
    const [[otherCosts]] = await connection.query(`SELECT COALESCE(SUM(valor), 0) AS total FROM custos_veiculo WHERE empresa_id = ? AND data_custo >= DATE_FORMAT(UTC_DATE(), '%Y-%m-01')`, [empresaId]);
    const [[alerts]] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM planos_manutencao pm INNER JOIN veiculos v ON v.empresa_id = pm.empresa_id AND v.id = pm.veiculo_id WHERE pm.empresa_id = ? AND pm.ativo = TRUE AND ((pm.proxima_data IS NOT NULL AND pm.proxima_data <= DATE_ADD(UTC_DATE(), INTERVAL pm.antecedencia_alerta_dias DAY)) OR (pm.proximo_km IS NOT NULL AND pm.proximo_km <= v.km_atual + pm.antecedencia_alerta_km))) AS manutencoes,
        (SELECT COUNT(*) FROM documentos_veiculo dv WHERE dv.empresa_id = ? AND dv.status = 'ATIVO' AND dv.validade_em IS NOT NULL AND dv.validade_em <= DATE_ADD(UTC_DATE(), INTERVAL dv.alerta_dias DAY)) +
        (SELECT COUNT(*) FROM documentos_usuario du WHERE du.empresa_id = ? AND du.status = 'ATIVO' AND du.validade_em IS NOT NULL AND du.validade_em <= DATE_ADD(UTC_DATE(), INTERVAL du.alerta_dias DAY)) AS documentos,
        (SELECT COUNT(*) FROM multas m WHERE m.empresa_id = ? AND m.status IN ('PENDENTE','EM_TRATAMENTO','RECURSO')) AS multas
    `, [empresaId, empresaId, empresaId, empresaId]);

    const custoCombustivel = Number(fuel.total || 0);
    const custoManutencao = Number(maintenance.total || 0);
    const outrosCustos = Number(otherCosts.total || 0);
    const custoTotal = custoCombustivel + custoManutencao + outrosCustos;
    const km = Number(month.km || 0);
    return {
      frota: { total: Number(fleet.total || 0), disponiveis: Number(fleet.disponiveis || 0), manutencao: Number(fleet.manutencao || 0), bloqueados: Number(fleet.bloqueados || 0) },
      mes: { viagens: Number(month.viagens || 0), km, custoCombustivel, custoManutencao, outrosCustos, custoTotal, custoKm: km > 0 ? Number((custoTotal / km).toFixed(2)) : 0 },
      alertas: { manutencoes: Number(alerts.manutencoes || 0), documentos: Number(alerts.documentos || 0), multas: Number(alerts.multas || 0) },
    };
  } finally { connection.release(); }
}
