USE frota_leve;

-- FROTA LEVE — INTEGRIDADE PRÉ-BANCO. Execute depois de 004_api_safety.sql e antes do seed.
INSERT IGNORE INTO permissoes (codigo, descricao) VALUES
('CENTRO_CUSTO_VISUALIZAR','Visualizar centros de custo disponíveis para reservas e relatórios'),
('OPERACAO_EXECUTAR','Executar retirada e devolução das próprias viagens'),
('OPERACAO_GERENCIAR','Executar e acompanhar retirada e devolução da frota');

ALTER TABLE departamentos ADD UNIQUE KEY uq_departamentos_empresa_id_unidade (empresa_id,id,unidade_id);
ALTER TABLE usuarios DROP FOREIGN KEY fk_usuarios_departamento_tenant, ADD CONSTRAINT chk_usuarios_departamento_unidade CHECK (departamento_id IS NULL OR unidade_id IS NOT NULL), ADD CONSTRAINT fk_usuarios_departamento_unidade_tenant FOREIGN KEY (empresa_id,departamento_id,unidade_id) REFERENCES departamentos(empresa_id,id,unidade_id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE reserva_destinos DROP FOREIGN KEY fk_reserva_destinos_reserva_tenant, DROP CHECK chk_reserva_destinos_ordem, ADD CONSTRAINT fk_reserva_destinos_reserva_tenant FOREIGN KEY (empresa_id,reserva_id) REFERENCES reservas(empresa_id,id) ON UPDATE CASCADE ON DELETE RESTRICT, ADD CONSTRAINT chk_reserva_destinos_ordem CHECK (ordem>=1);
ALTER TABLE manutencoes MODIFY previsao_fim DATETIME NOT NULL, ADD COLUMN cancelado_em DATETIME NULL AFTER status, ADD COLUMN cancelado_por_id BIGINT UNSIGNED NULL AFTER cancelado_em, ADD COLUMN motivo_cancelamento VARCHAR(1000) NULL AFTER cancelado_por_id, ADD UNIQUE KEY uq_manutencoes_empresa_id_veiculo (empresa_id,id,veiculo_id), ADD CONSTRAINT fk_manutencoes_cancelado_por_tenant FOREIGN KEY (empresa_id,cancelado_por_id) REFERENCES usuarios(empresa_id,id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE bloqueios_veiculo DROP FOREIGN KEY fk_bloqueios_manutencao_tenant, ADD COLUMN motivo_cancelamento VARCHAR(1000) NULL AFTER cancelado_por_id, ADD UNIQUE KEY uq_bloqueios_empresa_manutencao (empresa_id,manutencao_id), ADD CONSTRAINT fk_bloqueios_manutencao_veiculo_tenant FOREIGN KEY (empresa_id,manutencao_id,veiculo_id) REFERENCES manutencoes(empresa_id,id,veiculo_id) ON UPDATE CASCADE ON DELETE RESTRICT;
