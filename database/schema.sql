CREATE DATABASE IF NOT EXISTS frota_leve CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE frota_leve;

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
  CONSTRAINT fk_cidades_estado FOREIGN KEY (estado_id) REFERENCES estados(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE unidades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  cidade_id INT UNSIGNED NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_unidades_nome (nome),
  KEY idx_unidades_cidade (cidade_id),
  KEY idx_unidades_ativo (ativo),
  CONSTRAINT fk_unidades_cidade FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE departamentos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  unidade_id INT UNSIGNED NULL,
  nome VARCHAR(120) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departamento_unidade_nome (unidade_id, nome),
  KEY idx_departamentos_unidade (unidade_id),
  KEY idx_departamentos_ativo (ativo),
  CONSTRAINT fk_departamentos_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_funcionario VARCHAR(30) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL,
  telefone VARCHAR(30) NULL,
  unidade_id INT UNSIGNED NULL,
  departamento_id INT UNSIGNED NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login_em DATETIME NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_codigo_funcionario (codigo_funcionario),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_nome (nome),
  KEY idx_usuarios_unidade (unidade_id),
  KEY idx_usuarios_departamento (departamento_id),
  KEY idx_usuarios_ativo (ativo),
  CONSTRAINT fk_usuarios_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuarios_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE perfis (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_perfis_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE permissoes (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissoes_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE usuario_perfis (
  usuario_id BIGINT UNSIGNED NOT NULL,
  perfil_id SMALLINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, perfil_id),
  KEY idx_usuario_perfis_perfil (perfil_id),
  CONSTRAINT fk_usuario_perfis_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_usuario_perfis_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE perfil_permissoes (
  perfil_id SMALLINT UNSIGNED NOT NULL,
  permissao_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (perfil_id, permissao_id),
  KEY idx_perfil_permissoes_permissao (permissao_id),
  CONSTRAINT fk_perfil_permissoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_perfil_permissoes_permissao FOREIGN KEY (permissao_id) REFERENCES permissoes(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE categorias_veiculo (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(80) NOT NULL,
  descricao VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_veiculo_nome (nome)
) ENGINE=InnoDB;

CREATE TABLE veiculos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  UNIQUE KEY uq_veiculos_placa (placa),
  UNIQUE KEY uq_veiculos_codigo_interno (codigo_interno),
  KEY idx_veiculos_categoria (categoria_id),
  KEY idx_veiculos_unidade (unidade_id),
  KEY idx_veiculos_status (ativo, status_operacional),
  KEY idx_veiculos_modelo (marca, modelo),
  CONSTRAINT fk_veiculos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_veiculo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_veiculos_unidade FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_veiculos_capacidade CHECK (capacidade IS NULL OR capacidade >= 1),
  CONSTRAINT chk_veiculos_ano CHECK (ano IS NULL OR ano BETWEEN 1900 AND 2200)
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  KEY idx_reservas_veiculo_periodo (veiculo_id, data_hora_inicio, data_hora_fim),
  KEY idx_reservas_solicitante (solicitante_id, data_hora_inicio),
  KEY idx_reservas_motorista (motorista_id, data_hora_inicio),
  KEY idx_reservas_criado_por (criado_por_id),
  KEY idx_reservas_status_inicio (status, data_hora_inicio),
  CONSTRAINT fk_reservas_solicitante FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_motorista FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_criado_por FOREIGN KEY (criado_por_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_cancelado_por FOREIGN KEY (cancelado_por_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_reservas_periodo CHECK (data_hora_fim > data_hora_inicio),
  CONSTRAINT chk_reservas_cancelamento CHECK ((status='CONFIRMADA' AND cancelado_em IS NULL AND cancelado_por_id IS NULL) OR (status='CANCELADA' AND cancelado_em IS NOT NULL AND cancelado_por_id IS NOT NULL))
) ENGINE=InnoDB;

CREATE TABLE reserva_destinos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reserva_id BIGINT UNSIGNED NOT NULL,
  cidade_id INT UNSIGNED NOT NULL,
  ordem TINYINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reserva_destino_ordem (reserva_id, ordem),
  KEY idx_reserva_destinos_cidade (cidade_id),
  CONSTRAINT fk_reserva_destinos_reserva FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_reserva_destinos_cidade FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_reserva_destinos_ordem CHECK (ordem BETWEEN 1 AND 10)
) ENGINE=InnoDB;

CREATE TABLE manutencoes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  KEY idx_manutencoes_veiculo (veiculo_id, data_hora_inicio),
  KEY idx_manutencoes_status (status),
  CONSTRAINT fk_manutencoes_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_manutencoes_criado_por FOREIGN KEY (criado_por_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_manutencoes_previsao CHECK (previsao_fim IS NULL OR previsao_fim >= data_hora_inicio),
  CONSTRAINT chk_manutencoes_fim CHECK (data_hora_fim IS NULL OR data_hora_fim >= data_hora_inicio)
) ENGINE=InnoDB;

CREATE TABLE bloqueios_veiculo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  KEY idx_bloqueios_veiculo_periodo (veiculo_id, data_hora_inicio, data_hora_fim, ativo),
  KEY idx_bloqueios_manutencao (manutencao_id),
  CONSTRAINT fk_bloqueios_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_manutencao FOREIGN KEY (manutencao_id) REFERENCES manutencoes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_criado_por FOREIGN KEY (criado_por_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bloqueios_cancelado_por FOREIGN KEY (cancelado_por_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_bloqueios_periodo CHECK (data_hora_fim > data_hora_inicio)
) ENGINE=InnoDB;

CREATE TABLE auditoria (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NULL,
  acao VARCHAR(100) NOT NULL,
  entidade VARCHAR(100) NOT NULL,
  entidade_id VARCHAR(100) NULL,
  dados_anteriores JSON NULL,
  dados_novos JSON NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auditoria_usuario (usuario_id),
  KEY idx_auditoria_entidade (entidade, entidade_id),
  KEY idx_auditoria_acao (acao),
  KEY idx_auditoria_data (criado_em),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO estados (codigo_ibge, uf, nome) VALUES
(11,'RO','Rondônia'),(12,'AC','Acre'),(13,'AM','Amazonas'),(14,'RR','Roraima'),(15,'PA','Pará'),(16,'AP','Amapá'),(17,'TO','Tocantins'),(21,'MA','Maranhão'),(22,'PI','Piauí'),(23,'CE','Ceará'),(24,'RN','Rio Grande do Norte'),(25,'PB','Paraíba'),(26,'PE','Pernambuco'),(27,'AL','Alagoas'),(28,'SE','Sergipe'),(29,'BA','Bahia'),(31,'MG','Minas Gerais'),(32,'ES','Espírito Santo'),(33,'RJ','Rio de Janeiro'),(35,'SP','São Paulo'),(41,'PR','Paraná'),(42,'SC','Santa Catarina'),(43,'RS','Rio Grande do Sul'),(50,'MS','Mato Grosso do Sul'),(51,'MT','Mato Grosso'),(52,'GO','Goiás'),(53,'DF','Distrito Federal');

INSERT INTO perfis (codigo,nome,descricao) VALUES
('COLABORADOR','Colaborador','Usuário padrão do sistema de reservas'),
('GESTOR','Gestor','Gestor com acesso às reservas da equipe'),
('FROTA','Frota','Equipe responsável pela operação da frota'),
('ADMIN','Administrador','Administrador completo do Frota Leve');

INSERT INTO categorias_veiculo (nome,descricao) VALUES
('Passeio','Veículo leve para transporte de passageiros'),
('Utilitário','Veículo destinado a serviços e transporte de materiais'),
('SUV','Veículo utilitário esportivo'),
('Pickup','Veículo com caçamba'),
('Van','Veículo para transporte de maior número de passageiros');
