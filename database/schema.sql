CREATE DATABASE IF NOT EXISTS frota_leve
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE frota_leve;

-- ============================================================
-- FROTA LEVE — BASE SAAS MULTIEMPRESA
-- MySQL 8+
-- ============================================================

-- ============================================================
-- DADOS GLOBAIS
-- ============================================================

CREATE TABLE estados (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_ibge TINYINT UNSIGNED NOT NULL,
  uf CHAR(2) NOT NULL,
  nome VARCHAR(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estados_codigo_ibge (codigo_ibge),
  UNIQUE KEY uq_estados_uf (uf),
  UNIQUE KEY uq_estados_nome (nome)
) ENGINE=InnoDB;

CREATE TABLE cidades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_ibge INT UNSIGNED NOT NULL,
  estado_id TINYINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cidades_codigo_ibge (codigo_ibge),
  KEY idx_cidades_estado_nome (estado_id, nome),
  CONSTRAINT fk_cidades_estado
    FOREIGN KEY (estado_id) REFERENCES estados(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE planos (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NULL,
  limite_veiculos INT UNSIGNED NULL,
  limite_usuarios INT UNSIGNED NULL,
  periodo_trial_dias SMALLINT UNSIGNED NOT NULL DEFAULT 14,
  recursos JSON NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_planos_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE permissoes (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissoes_codigo (codigo)
) ENGINE=InnoDB;

-- ============================================================
-- CONTROL PLANE DA PLATAFORMA
-- ============================================================

CREATE TABLE empresas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(80) NOT NULL,
  razao_social VARCHAR(180) NOT NULL,
  nome_fantasia VARCHAR(150) NOT NULL,
  cnpj CHAR(14) NULL,
  email_contato VARCHAR(180) NULL,
  telefone_contato VARCHAR(30) NULL,
  status ENUM('TRIAL','ATIVA','SUSPENSA','CANCELADA') NOT NULL DEFAULT 'TRIAL',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_empresas_slug (slug),
  UNIQUE KEY uq_empresas_cnpj (cnpj),
  KEY idx_empresas_status (status)
) ENGINE=InnoDB;

CREATE TABLE empresa_configuracoes (
  empresa_id BIGINT UNSIGNED NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
  intervalo_reserva_minutos SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  antecedencia_minima_minutos INT UNSIGNED NOT NULL DEFAULT 0,
  antecedencia_cancelamento_minutos INT UNSIGNED NOT NULL DEFAULT 0,
  max_destinos TINYINT UNSIGNED NOT NULL DEFAULT 10,
  permite_motorista_diferente BOOLEAN NOT NULL DEFAULT TRUE,
  exige_numero_chamado BOOLEAN NOT NULL DEFAULT FALSE,
  exige_centro_custo BOOLEAN NOT NULL DEFAULT FALSE,
  permite_edicao_reserva BOOLEAN NOT NULL DEFAULT TRUE,
  permite_cancelamento BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (empresa_id),
  CONSTRAINT fk_empresa_configuracoes_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_empresa_config_intervalo
    CHECK (intervalo_reserva_minutos IN (15,30,60)),
  CONSTRAINT chk_empresa_config_destinos
    CHECK (max_destinos BETWEEN 1 AND 10)
) ENGINE=InnoDB;

CREATE TABLE empresa_branding (
  empresa_id BIGINT UNSIGNED NOT NULL,
  nome_produto VARCHAR(100) NOT NULL DEFAULT 'Frota Leve',
  logo_url VARCHAR(500) NULL,
  favicon_url VARCHAR(500) NULL,
  cor_primaria CHAR(7) NOT NULL DEFAULT '#0B6B3A',
  cor_secundaria CHAR(7) NOT NULL DEFAULT '#0C2F21',
  email_suporte VARCHAR(180) NULL,
  exibir_marca_plataforma BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (empresa_id),
  CONSTRAINT fk_empresa_branding_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assinaturas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  plano_id SMALLINT UNSIGNED NOT NULL,
  status ENUM('TRIAL','ATIVA','PAUSADA','CANCELADA','EXPIRADA') NOT NULL DEFAULT 'TRIAL',
  trial_ate DATETIME NULL,
  periodo_inicio DATETIME NOT NULL,
  periodo_fim DATETIME NULL,
  cancelado_em DATETIME NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_assinaturas_empresa_status (empresa_id, status),
  KEY idx_assinaturas_plano (plano_id),
  CONSTRAINT fk_assinaturas_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_assinaturas_plano
    FOREIGN KEY (plano_id) REFERENCES planos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE usuarios_plataforma (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  auth_provider VARCHAR(50) NULL,
  auth_subject VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login_em DATETIME NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_plataforma_email (email),
  UNIQUE KEY uq_usuarios_plataforma_auth (auth_provider, auth_subject)
) ENGINE=InnoDB;

-- ============================================================
-- DATA PLANE — DADOS ISOLADOS POR TENANT
-- ============================================================

CREATE TABLE unidades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  cidade_id INT UNSIGNED NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_unidades_empresa_nome (empresa_id, nome),
  UNIQUE KEY uq_unidades_empresa_id (empresa_id, id),
  KEY idx_unidades_cidade (cidade_id),
  KEY idx_unidades_empresa_ativo (empresa_id, ativo),
  CONSTRAINT fk_unidades_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_unidades_cidade
    FOREIGN KEY (cidade_id) REFERENCES cidades(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE departamentos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  unidade_id INT UNSIGNED NOT NULL,
  nome VARCHAR(120) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departamentos_empresa_unidade_nome (empresa_id, unidade_id, nome),
  UNIQUE KEY uq_departamentos_empresa_id (empresa_id, id),
  KEY idx_departamentos_empresa_ativo (empresa_id, ativo),
  CONSTRAINT fk_departamentos_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_departamentos_unidade_tenant
    FOREIGN KEY (empresa_id, unidade_id) REFERENCES unidades(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  codigo_funcionario VARCHAR(30) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  telefone VARCHAR(30) NULL,
  unidade_id INT UNSIGNED NULL,
  departamento_id INT UNSIGNED NULL,
  auth_provider VARCHAR(50) NULL,
  auth_subject VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login_em DATETIME NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_empresa_codigo (empresa_id, codigo_funcionario),
  UNIQUE KEY uq_usuarios_empresa_email (empresa_id, email),
  UNIQUE KEY uq_usuarios_empresa_auth (empresa_id, auth_provider, auth_subject),
  UNIQUE KEY uq_usuarios_empresa_id (empresa_id, id),
  KEY idx_usuarios_empresa_nome (empresa_id, nome),
  KEY idx_usuarios_empresa_ativo (empresa_id, ativo),
  CONSTRAINT fk_usuarios_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuarios_unidade_tenant
    FOREIGN KEY (empresa_id, unidade_id) REFERENCES unidades(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuarios_departamento_tenant
    FOREIGN KEY (empresa_id, departamento_id) REFERENCES departamentos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE perfis (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_perfis_empresa_codigo (empresa_id, codigo),
  UNIQUE KEY uq_perfis_empresa_id (empresa_id, id),
  CONSTRAINT fk_perfis_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE usuario_perfis (
  empresa_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  perfil_id SMALLINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (empresa_id, usuario_id, perfil_id),
  KEY idx_usuario_perfis_perfil (empresa_id, perfil_id),
  CONSTRAINT fk_usuario_perfis_usuario_tenant
    FOREIGN KEY (empresa_id, usuario_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_usuario_perfis_perfil_tenant
    FOREIGN KEY (empresa_id, perfil_id) REFERENCES perfis(empresa_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE perfil_permissoes (
  empresa_id BIGINT UNSIGNED NOT NULL,
  perfil_id SMALLINT UNSIGNED NOT NULL,
  permissao_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (empresa_id, perfil_id, permissao_id),
  KEY idx_perfil_permissoes_permissao (permissao_id),
  CONSTRAINT fk_perfil_permissoes_perfil_tenant
    FOREIGN KEY (empresa_id, perfil_id) REFERENCES perfis(empresa_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_perfil_permissoes_permissao
    FOREIGN KEY (permissao_id) REFERENCES permissoes(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categorias_veiculo (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(80) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_empresa_nome (empresa_id, nome),
  UNIQUE KEY uq_categorias_empresa_id (empresa_id, id),
  CONSTRAINT fk_categorias_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE veiculos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  codigo_interno VARCHAR(50) NULL,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(80) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  categoria_id SMALLINT UNSIGNED NOT NULL,
  unidade_id INT UNSIGNED NULL,
  capacidade TINYINT UNSIGNED NULL,
  cor VARCHAR(50) NULL,
  ano SMALLINT UNSIGNED NULL,
  status_operacional ENUM('DISPONIVEL','MANUTENCAO','BLOQUEADO') NOT NULL DEFAULT 'DISPONIVEL',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_veiculos_empresa_placa (empresa_id, placa),
  UNIQUE KEY uq_veiculos_empresa_codigo (empresa_id, codigo_interno),
  UNIQUE KEY uq_veiculos_empresa_id (empresa_id, id),
  KEY idx_veiculos_empresa_status (empresa_id, ativo, status_operacional),
  KEY idx_veiculos_empresa_modelo (empresa_id, marca, modelo),
  CONSTRAINT fk_veiculos_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_veiculos_categoria_tenant
    FOREIGN KEY (empresa_id, categoria_id) REFERENCES categorias_veiculo(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_veiculos_unidade_tenant
    FOREIGN KEY (empresa_id, unidade_id) REFERENCES unidades(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_veiculos_capacidade CHECK (capacidade IS NULL OR capacidade >= 1),
  CONSTRAINT chk_veiculos_ano CHECK (ano IS NULL OR ano BETWEEN 1900 AND 2200)
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  solicitante_id BIGINT UNSIGNED NOT NULL,
  motorista_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  criado_por_id BIGINT UNSIGNED NOT NULL,
  data_hora_inicio DATETIME NOT NULL,
  data_hora_fim DATETIME NOT NULL,
  motivo VARCHAR(1000) NOT NULL,
  numero_chamado VARCHAR(100) NULL,
  observacao TEXT NULL,
  status ENUM('CONFIRMADA','CANCELADA') NOT NULL DEFAULT 'CONFIRMADA',
  cancelado_em DATETIME NULL,
  cancelado_por_id BIGINT UNSIGNED NULL,
  motivo_cancelamento VARCHAR(1000) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservas_empresa_id (empresa_id, id),
  KEY idx_reservas_empresa_veiculo_periodo (empresa_id, veiculo_id, data_hora_inicio, data_hora_fim),
  KEY idx_reservas_empresa_solicitante (empresa_id, solicitante_id, data_hora_inicio),
  KEY idx_reservas_empresa_motorista (empresa_id, motorista_id, data_hora_inicio),
  KEY idx_reservas_empresa_status_inicio (empresa_id, status, data_hora_inicio),
  CONSTRAINT fk_reservas_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_solicitante_tenant
    FOREIGN KEY (empresa_id, solicitante_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_motorista_tenant
    FOREIGN KEY (empresa_id, motorista_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_criado_por_tenant
    FOREIGN KEY (empresa_id, criado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_cancelado_por_tenant
    FOREIGN KEY (empresa_id, cancelado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_reservas_periodo CHECK (data_hora_fim > data_hora_inicio),
  CONSTRAINT chk_reservas_cancelamento CHECK (
    (status = 'CONFIRMADA' AND cancelado_em IS NULL AND cancelado_por_id IS NULL)
    OR
    (status = 'CANCELADA' AND cancelado_em IS NOT NULL AND cancelado_por_id IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE TABLE reserva_destinos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  reserva_id BIGINT UNSIGNED NOT NULL,
  cidade_id INT UNSIGNED NOT NULL,
  ordem TINYINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reserva_destino_ordem (empresa_id, reserva_id, ordem),
  KEY idx_reserva_destinos_cidade (cidade_id),
  CONSTRAINT fk_reserva_destinos_reserva_tenant
    FOREIGN KEY (empresa_id, reserva_id) REFERENCES reservas(empresa_id, id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_reserva_destinos_cidade
    FOREIGN KEY (cidade_id) REFERENCES cidades(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_reserva_destinos_ordem CHECK (ordem BETWEEN 1 AND 10)
) ENGINE=InnoDB;

CREATE TABLE manutencoes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  data_hora_inicio DATETIME NOT NULL,
  previsao_fim DATETIME NULL,
  data_hora_fim DATETIME NULL,
  quilometragem INT UNSIGNED NULL,
  fornecedor VARCHAR(180) NULL,
  observacao TEXT NULL,
  status ENUM('AGENDADA','EM_ANDAMENTO','CONCLUIDA','CANCELADA') NOT NULL DEFAULT 'AGENDADA',
  criado_por_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_manutencoes_empresa_id (empresa_id, id),
  KEY idx_manutencoes_empresa_veiculo (empresa_id, veiculo_id, data_hora_inicio),
  KEY idx_manutencoes_empresa_status (empresa_id, status),
  CONSTRAINT fk_manutencoes_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_manutencoes_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_manutencoes_criado_por_tenant
    FOREIGN KEY (empresa_id, criado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_manutencoes_previsao CHECK (previsao_fim IS NULL OR previsao_fim >= data_hora_inicio),
  CONSTRAINT chk_manutencoes_fim CHECK (data_hora_fim IS NULL OR data_hora_fim >= data_hora_inicio)
) ENGINE=InnoDB;

CREATE TABLE bloqueios_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  veiculo_id BIGINT UNSIGNED NOT NULL,
  manutencao_id BIGINT UNSIGNED NULL,
  data_hora_inicio DATETIME NOT NULL,
  data_hora_fim DATETIME NOT NULL,
  tipo ENUM('MANUAL','MANUTENCAO','OUTRO') NOT NULL DEFAULT 'MANUAL',
  motivo VARCHAR(1000) NOT NULL,
  criado_por_id BIGINT UNSIGNED NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  cancelado_em DATETIME NULL,
  cancelado_por_id BIGINT UNSIGNED NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bloqueios_empresa_id (empresa_id, id),
  KEY idx_bloqueios_empresa_veiculo_periodo (empresa_id, veiculo_id, data_hora_inicio, data_hora_fim, ativo),
  CONSTRAINT fk_bloqueios_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_veiculo_tenant
    FOREIGN KEY (empresa_id, veiculo_id) REFERENCES veiculos(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_manutencao_tenant
    FOREIGN KEY (empresa_id, manutencao_id) REFERENCES manutencoes(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_criado_por_tenant
    FOREIGN KEY (empresa_id, criado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_cancelado_por_tenant
    FOREIGN KEY (empresa_id, cancelado_por_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_bloqueios_periodo CHECK (data_hora_fim > data_hora_inicio)
) ENGINE=InnoDB;

CREATE TABLE auditoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  empresa_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NULL,
  acao VARCHAR(100) NOT NULL,
  entidade VARCHAR(100) NOT NULL,
  entidade_id VARCHAR(100) NULL,
  dados_anteriores JSON NULL,
  dados_novos JSON NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  request_id VARCHAR(80) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_empresa_data (empresa_id, criado_em),
  KEY idx_auditoria_empresa_usuario (empresa_id, usuario_id),
  KEY idx_auditoria_empresa_entidade (empresa_id, entidade, entidade_id),
  KEY idx_auditoria_empresa_acao (empresa_id, acao),
  CONSTRAINT fk_auditoria_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_auditoria_usuario_tenant
    FOREIGN KEY (empresa_id, usuario_id) REFERENCES usuarios(empresa_id, id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE auditoria_plataforma (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_plataforma_id BIGINT UNSIGNED NULL,
  acao VARCHAR(100) NOT NULL,
  entidade VARCHAR(100) NOT NULL,
  entidade_id VARCHAR(100) NULL,
  dados_anteriores JSON NULL,
  dados_novos JSON NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  request_id VARCHAR(80) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_plataforma_data (criado_em),
  KEY idx_auditoria_plataforma_usuario (usuario_plataforma_id),
  CONSTRAINT fk_auditoria_plataforma_usuario
    FOREIGN KEY (usuario_plataforma_id) REFERENCES usuarios_plataforma(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- SEEDS GLOBAIS
-- ============================================================

INSERT INTO estados (codigo_ibge, uf, nome) VALUES
(11,'RO','Rondônia'),(12,'AC','Acre'),(13,'AM','Amazonas'),(14,'RR','Roraima'),
(15,'PA','Pará'),(16,'AP','Amapá'),(17,'TO','Tocantins'),(21,'MA','Maranhão'),
(22,'PI','Piauí'),(23,'CE','Ceará'),(24,'RN','Rio Grande do Norte'),(25,'PB','Paraíba'),
(26,'PE','Pernambuco'),(27,'AL','Alagoas'),(28,'SE','Sergipe'),(29,'BA','Bahia'),
(31,'MG','Minas Gerais'),(32,'ES','Espírito Santo'),(33,'RJ','Rio de Janeiro'),(35,'SP','São Paulo'),
(41,'PR','Paraná'),(42,'SC','Santa Catarina'),(43,'RS','Rio Grande do Sul'),(50,'MS','Mato Grosso do Sul'),
(51,'MT','Mato Grosso'),(52,'GO','Goiás'),(53,'DF','Distrito Federal');

INSERT INTO planos (codigo, nome, descricao, limite_veiculos, limite_usuarios, periodo_trial_dias, recursos) VALUES
('STARTER','Starter','Plano inicial para operações pequenas',10,100,14,JSON_OBJECT('branding',true,'relatorios',true)),
('BUSINESS','Business','Plano para operações em crescimento',50,1000,14,JSON_OBJECT('branding',true,'relatorios',true,'integracoes',true)),
('ENTERPRISE','Enterprise','Plano corporativo com limites negociados',NULL,NULL,30,JSON_OBJECT('branding',true,'relatorios',true,'integracoes',true,'sso',true));

INSERT INTO permissoes (codigo, descricao) VALUES
('RESERVA_CRIAR','Criar a própria reserva'),
('RESERVA_CRIAR_PARA_OUTRO','Criar reserva para outro colaborador'),
('RESERVA_VISUALIZAR_PROPRIA','Visualizar as próprias reservas'),
('RESERVA_VISUALIZAR_EQUIPE','Visualizar reservas da equipe'),
('RESERVA_VISUALIZAR_TODAS','Visualizar todas as reservas'),
('RESERVA_EDITAR_PROPRIA','Editar a própria reserva'),
('RESERVA_EDITAR_TODAS','Editar qualquer reserva'),
('RESERVA_CANCELAR_PROPRIA','Cancelar a própria reserva'),
('RESERVA_CANCELAR_TODAS','Cancelar qualquer reserva'),
('AGENDA_VISUALIZAR','Visualizar disponibilidade de veículos'),
('AGENDA_GERAL_VISUALIZAR','Visualizar agenda completa da frota'),
('VEICULO_VISUALIZAR','Visualizar veículos'),
('VEICULO_CRIAR','Cadastrar veículos'),
('VEICULO_EDITAR','Editar veículos'),
('VEICULO_INATIVAR','Inativar veículos'),
('VEICULO_BLOQUEAR','Criar bloqueios de veículos'),
('MANUTENCAO_VISUALIZAR','Visualizar manutenções'),
('MANUTENCAO_GERENCIAR','Criar e gerenciar manutenções'),
('USUARIO_VISUALIZAR','Visualizar usuários'),
('USUARIO_GERENCIAR','Gerenciar usuários'),
('PERFIL_GERENCIAR','Gerenciar perfis e permissões'),
('AUDITORIA_VISUALIZAR','Visualizar auditoria do tenant'),
('RELATORIO_VISUALIZAR','Visualizar relatórios'),
('EMPRESA_CONFIGURAR','Gerenciar configurações da empresa'),
('BRANDING_GERENCIAR','Gerenciar identidade visual da empresa');
