USE frota_leve;

-- Histórico financeiro não deve ser apagado fisicamente.
ALTER TABLE abastecimentos
  ADD COLUMN status ENUM('ATIVO','CANCELADO') NOT NULL DEFAULT 'ATIVO' AFTER observacao,
  ADD COLUMN cancelado_em DATETIME NULL AFTER status,
  ADD COLUMN cancelado_por_id BIGINT UNSIGNED NULL AFTER cancelado_em,
  ADD COLUMN motivo_cancelamento VARCHAR(500) NULL AFTER cancelado_por_id,
  ADD KEY idx_abastecimentos_empresa_status (empresa_id, status, data_hora),
  ADD CONSTRAINT fk_abastecimentos_cancelado_por_tenant
    FOREIGN KEY (empresa_id, cancelado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT;
