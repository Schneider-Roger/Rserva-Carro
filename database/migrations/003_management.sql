USE frota_leve;

-- ============================================================
-- FROTA LEVE V2 — GESTÃO FINANCEIRA E PREVENTIVA
-- Execute depois de 002_operations.sql
-- ============================================================

CREATE TABLE centros_custo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(120) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_centros_custo_empresa_codigo (empresa_id, codigo),
  UNIQUE KEY uq_centros_custo_empresa_id (empresa_id, id),
  KEY idx_centros_custo_empresa_ativo (empresa_id, ativo),
  CONSTRAINT fk_centros_custo_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

ALTER TABLE reservas
  ADD COLUMN centro_custo_id BIGINT UNSIGNED NULL AFTER criado_por_id,
  ADD KEY idx_reservas_empresa_centro_custo (empresa_id, centro_custo_id),
  ADD CONSTRAINT fk_reservas_centro_custo_tenant
    FOREIGN KEY (empresa_id, centro_custo_id) REFERENCES centros_custo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE veiculos
  ADD COLUMN km_atual INT UNSIGNED NOT NULL DEFAULT 0 AFTER ano;

CREATE TABLE planos_manutencao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  descricao VARCHAR(500) NULL,
  intervalo_km INT UNSIGNED NULL,
  intervalo_dias INT UNSIGNED NULL,
  ultimo_km INT UNSIGNED NULL,
  ultima_data DATE NULL,
  proximo_km INT UNSIGNED NULL,
  proxima_data DATE NULL,
  antecedencia_alerta_km INT UNSIGNED NOT NULL DEFAULT 1000,
  antecedencia_alerta_dias SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_planos_manutencao_empresa_id (empresa_id, id),
  KEY idx_planos_manutencao_alerta (empresa_id, ativo, proxima_data, proximo_km),
  CONSTRAINT fk_planos_manutencao_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_plano_manutencao_intervalo
    CHECK (intervalo_km IS NOT NULL OR intervalo_dias IS NOT NULL)
) ENGINE=InnoDB;

ALTER TABLE manutencoes
  ADD COLUMN plano_manutencao_id BIGINT UNSIGNED NULL AFTER veiculo_id,
  ADD COLUMN centro_custo_id BIGINT UNSIGNED NULL AFTER plano_manutencao_id,
  ADD COLUMN custo_total DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER quilometragem,
  ADD KEY idx_manutencoes_empresa_plano (empresa_id, plano_manutencao_id),
  ADD KEY idx_manutencoes_empresa_centro (empresa_id, centro_custo_id),
  ADD CONSTRAINT fk_manutencoes_plano_tenant
    FOREIGN KEY (empresa_id, plano_manutencao_id) REFERENCES planos_manutencao(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  ADD CONSTRAINT fk_manutencoes_centro_custo_tenant
    FOREIGN KEY (empresa_id, centro_custo_id) REFERENCES centros_custo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE TABLE abastecimentos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  motorista_id BIGINT UNSIGNED NULL,
  operacao_id BIGINT UNSIGNED NULL,
  centro_custo_id BIGINT UNSIGNED NULL,
  data_hora DATETIME NOT NULL,
  quilometragem INT UNSIGNED NOT NULL,
  tipo_combustivel VARCHAR(50) NOT NULL,
  litros DECIMAL(10,3) NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  posto VARCHAR(180) NULL,
  comprovante_url VARCHAR(500) NULL,
  observacao VARCHAR(500) NULL,
  registrado_por_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_abastecimentos_empresa_id (empresa_id, id),
  KEY idx_abastecimentos_empresa_data (empresa_id, data_hora),
  KEY idx_abastecimentos_empresa_veiculo_data (empresa_id, veiculo_id, data_hora),
  KEY idx_abastecimentos_empresa_centro (empresa_id, centro_custo_id),
  CONSTRAINT fk_abastecimentos_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_abastecimentos_motorista_tenant
    FOREIGN KEY (empresa_id, motorista_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_abastecimentos_operacao_tenant
    FOREIGN KEY (empresa_id, operacao_id) REFERENCES operacoes_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_abastecimentos_centro_tenant
    FOREIGN KEY (empresa_id, centro_custo_id) REFERENCES centros_custo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_abastecimentos_registrado_por_tenant
    FOREIGN KEY (empresa_id, registrado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_abastecimentos_litros CHECK (litros > 0),
  CONSTRAINT chk_abastecimentos_valor CHECK (valor_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE custos_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  centro_custo_id BIGINT UNSIGNED NULL,
  categoria ENUM('PEDAGIO','ESTACIONAMENTO','LAVAGEM','SEGURO','IPVA','LICENCIAMENTO','LOCACAO','OUTRO') NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  data_custo DATE NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  documento_url VARCHAR(500) NULL,
  registrado_por_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_custos_veiculo_empresa_id (empresa_id, id),
  KEY idx_custos_empresa_data (empresa_id, data_custo),
  KEY idx_custos_empresa_veiculo_data (empresa_id, veiculo_id, data_custo),
  KEY idx_custos_empresa_centro (empresa_id, centro_custo_id),
  CONSTRAINT fk_custos_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_custos_centro_tenant
    FOREIGN KEY (empresa_id, centro_custo_id) REFERENCES centros_custo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_custos_registrado_por_tenant
    FOREIGN KEY (empresa_id, registrado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_custos_valor CHECK (valor >= 0)
) ENGINE=InnoDB;

CREATE TABLE documentos_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  numero VARCHAR(100) NULL,
  emissao_em DATE NULL,
  validade_em DATE NULL,
  alerta_dias SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  arquivo_url VARCHAR(500) NULL,
  observacao VARCHAR(500) NULL,
  status ENUM('ATIVO','VENCIDO','SUBSTITUIDO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  criado_por_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_documentos_veiculo_empresa_id (empresa_id, id),
  KEY idx_documentos_veiculo_validade (empresa_id, status, validade_em),
  KEY idx_documentos_veiculo (empresa_id, veiculo_id),
  CONSTRAINT fk_documentos_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_documentos_veiculo_criado_por_tenant
    FOREIGN KEY (empresa_id, criado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE documentos_usuario (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  numero VARCHAR(100) NULL,
  categoria VARCHAR(50) NULL,
  emissao_em DATE NULL,
  validade_em DATE NULL,
  alerta_dias SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  arquivo_url VARCHAR(500) NULL,
  status ENUM('ATIVO','VENCIDO','SUBSTITUIDO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  criado_por_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_documentos_usuario_empresa_id (empresa_id, id),
  KEY idx_documentos_usuario_validade (empresa_id, status, validade_em),
  KEY idx_documentos_usuario (empresa_id, usuario_id),
  CONSTRAINT fk_documentos_usuario_tenant
    FOREIGN KEY (empresa_id, usuario_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_documentos_usuario_criado_por_tenant
    FOREIGN KEY (empresa_id, criado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE multas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  motorista_id BIGINT UNSIGNED NULL,
  reserva_id BIGINT UNSIGNED NULL,
  operacao_id BIGINT UNSIGNED NULL,
  centro_custo_id BIGINT UNSIGNED NULL,
  auto_infracao VARCHAR(100) NULL,
  data_hora_infracao DATETIME NOT NULL,
  descricao VARCHAR(500) NOT NULL,
  local_infracao VARCHAR(255) NULL,
  valor DECIMAL(12,2) NOT NULL,
  pontos TINYINT UNSIGNED NULL,
  vencimento_em DATE NULL,
  status ENUM('PENDENTE','EM_TRATAMENTO','RECURSO','PAGA','CANCELADA') NOT NULL DEFAULT 'PENDENTE',
  documento_url VARCHAR(500) NULL,
  observacao VARCHAR(500) NULL,
  registrado_por_id BIGINT UNSIGNED NOT NULL,
  pago_em DATE NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_multas_empresa_id (empresa_id, id),
  KEY idx_multas_empresa_status (empresa_id, status, vencimento_em),
  KEY idx_multas_empresa_veiculo (empresa_id, veiculo_id, data_hora_infracao),
  KEY idx_multas_empresa_motorista (empresa_id, motorista_id),
  CONSTRAINT fk_multas_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_multas_motorista_tenant
    FOREIGN KEY (empresa_id, motorista_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_multas_reserva_tenant
    FOREIGN KEY (empresa_id, reserva_id) REFERENCES reservas(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_multas_operacao_tenant
    FOREIGN KEY (empresa_id, operacao_id) REFERENCES operacoes_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_multas_centro_tenant
    FOREIGN KEY (empresa_id, centro_custo_id) REFERENCES centros_custo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_multas_registrado_por_tenant
    FOREIGN KEY (empresa_id, registrado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_multas_valor CHECK (valor >= 0)
) ENGINE=InnoDB;

INSERT IGNORE INTO permissoes (codigo, descricao) VALUES
('GESTAO_DASHBOARD','Visualizar dashboard executivo da frota'),
('CENTRO_CUSTO_GERENCIAR','Gerenciar centros de custo'),
('ABASTECIMENTO_VISUALIZAR','Visualizar abastecimentos'),
('ABASTECIMENTO_GERENCIAR','Registrar e editar abastecimentos'),
('CUSTO_VISUALIZAR','Visualizar custos da frota'),
('CUSTO_GERENCIAR','Registrar e editar custos da frota'),
('DOCUMENTO_VISUALIZAR','Visualizar documentos e vencimentos'),
('DOCUMENTO_GERENCIAR','Gerenciar documentos e vencimentos'),
('MULTA_VISUALIZAR','Visualizar multas'),
('MULTA_GERENCIAR','Gerenciar multas');
