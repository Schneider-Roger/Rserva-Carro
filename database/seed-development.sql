USE frota_leve;

-- ============================================================
-- DADOS DE DESENVOLVIMENTO — SOMENTE AMBIENTE LOCAL
-- Ordem: schema -> 002 -> 003 -> 004 -> 005 -> este arquivo
-- ============================================================

-- Municípios mínimos para o tenant de demonstração. Produção deve usar a carga oficial completa do IBGE.
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 3551702, id, 'Sertãozinho' FROM estados WHERE uf='SP';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 3543402, id, 'Ribeirão Preto' FROM estados WHERE uf='SP';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 3516200, id, 'Franca' FROM estados WHERE uf='SP';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 3503208, id, 'Araraquara' FROM estados WHERE uf='SP';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 3170107, id, 'Uberaba' FROM estados WHERE uf='MG';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 3170206, id, 'Uberlândia' FROM estados WHERE uf='MG';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 4106902, id, 'Curitiba' FROM estados WHERE uf='PR';
INSERT IGNORE INTO cidades (codigo_ibge, estado_id, nome)
SELECT 4113700, id, 'Londrina' FROM estados WHERE uf='PR';

INSERT INTO empresas (id, slug, razao_social, nome_fantasia, email_contato, status)
VALUES (1, 'empresa-demo', 'Empresa Demonstração Ltda.', 'Empresa Demonstração', 'admin@empresa-demo.local', 'TRIAL');

INSERT INTO empresa_configuracoes (empresa_id, timezone, intervalo_reserva_minutos, max_destinos, permite_motorista_diferente, exige_numero_chamado, exige_centro_custo, permite_edicao_reserva, permite_cancelamento)
VALUES (1, 'America/Sao_Paulo', 30, 10, TRUE, FALSE, TRUE, TRUE, TRUE);

INSERT INTO empresa_branding (empresa_id, nome_produto, cor_primaria, cor_secundaria, email_suporte, exibir_marca_plataforma)
VALUES (1, 'Frota Leve', '#0B6B3A', '#0C2F21', 'suporte@empresa-demo.local', TRUE);

INSERT INTO assinaturas (empresa_id, plano_id, status, trial_ate, periodo_inicio)
SELECT 1, id, 'TRIAL', DATE_ADD(UTC_TIMESTAMP(), INTERVAL periodo_trial_dias DAY), UTC_TIMESTAMP() FROM planos WHERE codigo = 'BUSINESS';

INSERT INTO unidades (empresa_id, nome, ativo) VALUES (1, 'Matriz', TRUE), (1, 'Unidade 2', TRUE);
SET @matriz_id = (SELECT id FROM unidades WHERE empresa_id = 1 AND nome = 'Matriz');

INSERT INTO departamentos (empresa_id, unidade_id, nome, ativo) VALUES
(1, @matriz_id, 'Tecnologia da Informação', TRUE),
(1, @matriz_id, 'Administrativo', TRUE),
(1, @matriz_id, 'Frota', TRUE);
SET @ti_id = (SELECT id FROM departamentos WHERE empresa_id = 1 AND nome = 'Tecnologia da Informação' LIMIT 1);
SET @adm_id = (SELECT id FROM departamentos WHERE empresa_id = 1 AND nome = 'Administrativo' LIMIT 1);

INSERT INTO usuarios (id, empresa_id, codigo_funcionario, nome, email, telefone, unidade_id, departamento_id, ativo) VALUES
(1, 1, '13967', 'Usuário Administrador', 'admin@empresa-demo.local', '(16) 99999-9999', @matriz_id, @ti_id, TRUE),
(2, 1, '14221', 'Carlos Silva', 'carlos@empresa-demo.local', '(16) 98888-1111', @matriz_id, @ti_id, TRUE),
(3, 1, '15190', 'Mariana Souza', 'mariana@empresa-demo.local', '(16) 97777-2222', @matriz_id, @adm_id, TRUE);
SET @admin_id = 1; SET @carlos_id = 2; SET @mariana_id = 3;

INSERT INTO perfis (empresa_id, codigo, nome, descricao) VALUES
(1, 'COLABORADOR', 'Colaborador', 'Usuário padrão do sistema de reservas'),
(1, 'GESTOR', 'Gestor', 'Gestor com acesso às reservas da equipe'),
(1, 'FROTA', 'Frota', 'Equipe responsável pela operação da frota'),
(1, 'ADMIN', 'Administrador', 'Administrador completo do tenant');

-- ADMIN recebe todas as permissões do produto.
INSERT INTO perfil_permissoes (empresa_id, perfil_id, permissao_id)
SELECT 1, p.id, pm.id FROM perfis p CROSS JOIN permissoes pm WHERE p.empresa_id = 1 AND p.codigo = 'ADMIN';

-- COLABORADOR: autosserviço, disponibilidade, motoristas e centros de custo para reserva.
INSERT INTO perfil_permissoes (empresa_id, perfil_id, permissao_id)
SELECT 1, p.id, pm.id FROM perfis p JOIN permissoes pm ON pm.codigo IN (
  'RESERVA_CRIAR','RESERVA_VISUALIZAR_PROPRIA','RESERVA_EDITAR_PROPRIA','RESERVA_CANCELAR_PROPRIA',
  'AGENDA_VISUALIZAR','VEICULO_VISUALIZAR','CENTRO_CUSTO_VISUALIZAR'
) WHERE p.empresa_id=1 AND p.codigo='COLABORADOR';

-- GESTOR: colaborador + visão restrita à própria equipe.
INSERT INTO perfil_permissoes (empresa_id, perfil_id, permissao_id)
SELECT 1, p.id, pm.id FROM perfis p JOIN permissoes pm ON pm.codigo IN (
  'RESERVA_CRIAR','RESERVA_CRIAR_PARA_OUTRO','RESERVA_VISUALIZAR_PROPRIA','RESERVA_VISUALIZAR_EQUIPE',
  'RESERVA_EDITAR_PROPRIA','RESERVA_CANCELAR_PROPRIA','AGENDA_VISUALIZAR','VEICULO_VISUALIZAR','CENTRO_CUSTO_VISUALIZAR'
) WHERE p.empresa_id=1 AND p.codigo='GESTOR';

INSERT INTO perfil_permissoes (empresa_id, perfil_id, permissao_id)
SELECT 1, p.id, pm.id FROM perfis p JOIN permissoes pm ON pm.codigo IN (
  'RESERVA_CRIAR','RESERVA_CRIAR_PARA_OUTRO','RESERVA_VISUALIZAR_PROPRIA','RESERVA_VISUALIZAR_TODAS',
  'RESERVA_EDITAR_PROPRIA','RESERVA_EDITAR_TODAS','RESERVA_CANCELAR_PROPRIA','RESERVA_CANCELAR_TODAS',
  'AGENDA_VISUALIZAR','AGENDA_GERAL_VISUALIZAR','VEICULO_VISUALIZAR','VEICULO_CRIAR','VEICULO_EDITAR','VEICULO_INATIVAR','VEICULO_BLOQUEAR',
  'MANUTENCAO_VISUALIZAR','MANUTENCAO_GERENCIAR','USUARIO_VISUALIZAR','RELATORIO_VISUALIZAR','GESTAO_DASHBOARD',
  'CENTRO_CUSTO_VISUALIZAR','CENTRO_CUSTO_GERENCIAR','ABASTECIMENTO_VISUALIZAR','ABASTECIMENTO_GERENCIAR','CUSTO_VISUALIZAR','CUSTO_GERENCIAR',
  'DOCUMENTO_VISUALIZAR','DOCUMENTO_GERENCIAR','MULTA_VISUALIZAR','MULTA_GERENCIAR'
) WHERE p.empresa_id=1 AND p.codigo='FROTA';

SET @admin_perfil=(SELECT id FROM perfis WHERE empresa_id=1 AND codigo='ADMIN');
SET @colaborador_perfil=(SELECT id FROM perfis WHERE empresa_id=1 AND codigo='COLABORADOR');
SET @gestor_perfil=(SELECT id FROM perfis WHERE empresa_id=1 AND codigo='GESTOR');
INSERT INTO usuario_perfis (empresa_id, usuario_id, perfil_id) VALUES
(1,@admin_id,@admin_perfil),(1,@carlos_id,@colaborador_perfil),(1,@mariana_id,@gestor_perfil);

INSERT INTO categorias_veiculo (empresa_id, nome, descricao) VALUES
(1,'Passeio','Veículo leve para transporte de passageiros'),
(1,'Utilitário','Veículo destinado a serviços e transporte de materiais'),
(1,'Pickup','Veículo com caçamba'),(1,'Van','Veículo para transporte de maior número de passageiros');
SET @cat_passeio=(SELECT id FROM categorias_veiculo WHERE empresa_id=1 AND nome='Passeio');
SET @cat_utilitario=(SELECT id FROM categorias_veiculo WHERE empresa_id=1 AND nome='Utilitário');
SET @cat_pickup=(SELECT id FROM categorias_veiculo WHERE empresa_id=1 AND nome='Pickup');

INSERT INTO veiculos (empresa_id,codigo_interno,placa,marca,modelo,categoria_id,unidade_id,capacidade,cor,ano,km_atual) VALUES
(1,'DIS401','ABC1D23','Fiat','Strada',@cat_utilitario,@matriz_id,2,'Branca',2025,45382),
(1,'MOB203','TJO8J81','Fiat','Mobi',@cat_passeio,@matriz_id,5,'Branco',2024,28810),
(1,'ARG112','FGH4J56','Fiat','Argo',@cat_passeio,@matriz_id,5,'Prata',2025,19120),
(1,'TOR078','KLM7N89','Fiat','Toro',@cat_pickup,@matriz_id,5,'Cinza',2024,51640);
SET @strada_id=(SELECT id FROM veiculos WHERE empresa_id=1 AND codigo_interno='DIS401');
SET @mobi_id=(SELECT id FROM veiculos WHERE empresa_id=1 AND codigo_interno='MOB203');
SET @toro_id=(SELECT id FROM veiculos WHERE empresa_id=1 AND codigo_interno='TOR078');

INSERT INTO centros_custo (empresa_id,codigo,nome,descricao) VALUES
(1,'TI','Tecnologia da Informação','Deslocamentos e custos do departamento de TI'),
(1,'ADM','Administrativo','Deslocamentos administrativos'),
(1,'COM','Comercial','Visitas e atividades comerciais');
SET @cc_ti=(SELECT id FROM centros_custo WHERE empresa_id=1 AND codigo='TI');
SET @cc_adm=(SELECT id FROM centros_custo WHERE empresa_id=1 AND codigo='ADM');

INSERT INTO chaves_veiculo (empresa_id,veiculo_id,codigo) VALUES
(1,@strada_id,'CH-DIS401'),(1,@mobi_id,'CH-MOB203'),(1,@toro_id,'CH-TOR078');

INSERT INTO checklist_modelos (empresa_id,nome,tipo,ativo) VALUES (1,'Checklist padrão','AMBOS',TRUE);
SET @checklist_modelo=(SELECT id FROM checklist_modelos WHERE empresa_id=1 AND nome='Checklist padrão');
INSERT INTO checklist_itens (empresa_id,modelo_id,descricao,ordem,obrigatorio,ativo) VALUES
(1,@checklist_modelo,'Pneus em condição aparente normal',1,TRUE,TRUE),
(1,@checklist_modelo,'Iluminação sem anormalidade aparente',2,TRUE,TRUE),
(1,@checklist_modelo,'Documentos presentes',3,TRUE,TRUE),
(1,@checklist_modelo,'Sem nova avaria aparente',4,TRUE,TRUE);

INSERT INTO abastecimentos (empresa_id,veiculo_id,motorista_id,centro_custo_id,data_hora,quilometragem,tipo_combustivel,litros,valor_total,posto,registrado_por_id,status) VALUES
(1,@strada_id,@admin_id,@cc_ti,DATE_SUB(UTC_TIMESTAMP(),INTERVAL 4 DAY),45190,'ETANOL',42.300,169.20,'Posto Demonstração',@admin_id,'ATIVO'),
(1,@mobi_id,@carlos_id,@cc_adm,DATE_SUB(UTC_TIMESTAMP(),INTERVAL 7 DAY),28620,'GASOLINA',35.800,215.16,'Posto Demonstração',@admin_id,'ATIVO'),
(1,@toro_id,@admin_id,@cc_ti,DATE_SUB(UTC_TIMESTAMP(),INTERVAL 10 DAY),51310,'DIESEL',55.000,341.00,'Posto Demonstração',@admin_id,'ATIVO');

INSERT INTO custos_veiculo (empresa_id,veiculo_id,centro_custo_id,categoria,descricao,data_custo,valor,registrado_por_id) VALUES
(1,@strada_id,@cc_ti,'PEDAGIO','Pedágios de viagem',DATE_SUB(UTC_DATE(),INTERVAL 3 DAY),42.60,@admin_id),
(1,@mobi_id,@cc_adm,'LAVAGEM','Lavagem completa',DATE_SUB(UTC_DATE(),INTERVAL 6 DAY),55.00,@admin_id);
