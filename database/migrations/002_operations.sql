USE frota_leve;

-- ============================================================
-- FROTA LEVE V1.5 — OPERAÇÃO DE RETIRADA E DEVOLUÇÃO
-- Execute depois de database/schema.sql
-- ============================================================

CREATE TABLE chaves_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(80) NOT NULL,
  status ENUM('DISPONIVEL','RETIRADA','INDISPONIVEL') NOT NULL DEFAULT 'DISPONIVEL',
  observacao VARCHAR(500) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_chaves_empresa_codigo (empresa_id, codigo),
  UNIQUE KEY uq_chaves_empresa_veiculo (empresa_id, veiculo_id),
  UNIQUE KEY uq_chaves_empresa_id (empresa_id, id),
  CONSTRAINT fk_chaves_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_chaves_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE operacoes_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  reserva_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  motorista_id BIGINT UNSIGNED NOT NULL,
  chave_id BIGINT UNSIGNED NULL,
  status ENUM('AGUARDANDO_RETIRADA','EM_USO','DEVOLVIDA','CANCELADA') NOT NULL DEFAULT 'AGUARDANDO_RETIRADA',

  retirado_em DATETIME NULL,
  retirado_por_id BIGINT UNSIGNED NULL,
  km_inicial INT UNSIGNED NULL,
  combustivel_inicial TINYINT UNSIGNED NULL,
  observacao_retirada TEXT NULL,

  devolvido_em DATETIME NULL,
  devolvido_por_id BIGINT UNSIGNED NULL,
  km_final INT UNSIGNED NULL,
  combustivel_final TINYINT UNSIGNED NULL,
  observacao_devolucao TEXT NULL,

  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_operacao_empresa_reserva (empresa_id, reserva_id),
  UNIQUE KEY uq_operacao_empresa_id (empresa_id, id),
  KEY idx_operacao_empresa_veiculo_status (empresa_id, veiculo_id, status),
  KEY idx_operacao_empresa_motorista (empresa_id, motorista_id, status),

  CONSTRAINT fk_operacao_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_reserva_tenant
    FOREIGN KEY (empresa_id, reserva_id) REFERENCES reservas(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_motorista_tenant
    FOREIGN KEY (empresa_id, motorista_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_chave_tenant
    FOREIGN KEY (empresa_id, chave_id) REFERENCES chaves_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_retirado_por_tenant
    FOREIGN KEY (empresa_id, retirado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_devolvido_por_tenant
    FOREIGN KEY (empresa_id, devolvido_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT chk_operacao_combustivel_inicial
    CHECK (combustivel_inicial IS NULL OR combustivel_inicial BETWEEN 0 AND 100),
  CONSTRAINT chk_operacao_combustivel_final
    CHECK (combustivel_final IS NULL OR combustivel_final BETWEEN 0 AND 100),
  CONSTRAINT chk_operacao_km
    CHECK (km_final IS NULL OR km_inicial IS NULL OR km_final >= km_inicial)
) ENGINE=InnoDB;

CREATE TABLE checklist_modelos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  tipo ENUM('RETIRADA','DEVOLUCAO','AMBOS') NOT NULL DEFAULT 'AMBOS',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_checklist_modelo_empresa_nome (empresa_id, nome),
  UNIQUE KEY uq_checklist_modelo_empresa_id (empresa_id, id),
  CONSTRAINT fk_checklist_modelo_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE checklist_itens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  modelo_id BIGINT UNSIGNED NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  ordem SMALLINT UNSIGNED NOT NULL,
  obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id),
  UNIQUE KEY uq_checklist_item_ordem (empresa_id, modelo_id, ordem),
  UNIQUE KEY uq_checklist_item_empresa_id (empresa_id, id),
  CONSTRAINT fk_checklist_item_modelo_tenant
    FOREIGN KEY (empresa_id, modelo_id) REFERENCES checklist_modelos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE operacao_checklist_respostas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  operacao_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  etapa ENUM('RETIRADA','DEVOLUCAO') NOT NULL,
  conforme BOOLEAN NOT NULL,
  observacao VARCHAR(500) NULL,
  respondido_por_id BIGINT UNSIGNED NOT NULL,
  respondido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_operacao_checklist_resposta (empresa_id, operacao_id, item_id, etapa),
  CONSTRAINT fk_resposta_operacao_tenant
    FOREIGN KEY (empresa_id, operacao_id) REFERENCES operacoes_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_resposta_item_tenant
    FOREIGN KEY (empresa_id, item_id) REFERENCES checklist_itens(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_resposta_usuario_tenant
    FOREIGN KEY (empresa_id, respondido_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE avarias (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  operacao_id BIGINT UNSIGNED NULL,
  reserva_id BIGINT UNSIGNED NULL,
  registrado_por_id BIGINT UNSIGNED NOT NULL,
  etapa ENUM('RETIRADA','DEVOLUCAO','FORA_DE_VIAGEM') NOT NULL,
  severidade ENUM('BAIXA','MEDIA','ALTA','CRITICA') NOT NULL DEFAULT 'BAIXA',
  descricao TEXT NOT NULL,
  status ENUM('ABERTA','EM_ANALISE','EM_REPARO','RESOLVIDA','DESCARTADA') NOT NULL DEFAULT 'ABERTA',
  registrado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolvido_em DATETIME NULL,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_avarias_empresa_id (empresa_id, id),
  KEY idx_avarias_empresa_veiculo_status (empresa_id, veiculo_id, status),
  CONSTRAINT fk_avarias_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_avarias_operacao_tenant
    FOREIGN KEY (empresa_id, operacao_id) REFERENCES operacoes_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_avarias_reserva_tenant
    FOREIGN KEY (empresa_id, reserva_id) REFERENCES reservas(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_avarias_registrado_por_tenant
    FOREIGN KEY (empresa_id, registrado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE custodia_chaves (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  chave_id BIGINT UNSIGNED NOT NULL,
  operacao_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  retirada_em DATETIME NOT NULL,
  devolvida_em DATETIME NULL,
  observacao VARCHAR(500) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_custodia_empresa_id (empresa_id, id),
  KEY idx_custodia_empresa_chave_aberta (empresa_id, chave_id, devolvida_em),
  CONSTRAINT fk_custodia_chave_tenant
    FOREIGN KEY (empresa_id, chave_id) REFERENCES chaves_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_custodia_operacao_tenant
    FOREIGN KEY (empresa_id, operacao_id) REFERENCES operacoes_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_custodia_usuario_tenant
    FOREIGN KEY (empresa_id, usuario_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Checklist padrão para cada tenant deve ser criado no onboarding.
