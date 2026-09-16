USE frota_leve;

-- ============================================================
-- DADOS DE DESENVOLVIMENTO
-- Execute somente em ambiente local depois das migrations.
-- ============================================================

INSERT INTO empresas (id, slug, razao_social, nome_fantasia, email_contato, status)
VALUES (1, 'empresa-demo', 'Empresa Demonstração Ltda.', 'Empresa Demonstração', 'admin@empresa-demo.local', 'TRIAL');

INSERT INTO empresa_configuracoes (
  empresa_id, timezone, intervalo_reserva_minutos, max_destinos,
  permite_motorista_diferente, exige_numero_chamado, exige_centro_custo,
  permite_edicao_reserva, permite_cancelamento
) VALUES (1, 'America/Sao_Paulo', 30, 10, TRUE, FALSE, TRUE, TRUE, TRUE);

INSERT INTO empresa_branding (
  empresa_id, nome_produto, cor_primaria, cor_secundaria, email_suporte, exibir_marca_plataforma
) VALUES (1, 'Frota Leve', '#0B6B3A', '#0C2F21', 'suporte@empresa-demo.local', TRUE);

INSERT INTO assinaturas (empresa_id, plano_id, status, trial_ate, periodo_inicio)
SELECT 1, id, 'TRIAL', DATE_ADD(NOW(), INTERVAL periodo_trial_dias DAY), NOW()
FROM planos WHERE codigo = 'BUSINESS';

INSERT INTO unidades (empresa_id, nome, ativo) VALUES
(1, 'Matriz', TRUE),
(1, 'Unidade 2', TRUE);

SET @matriz_id = (SELECT id FROM unidades WHERE empresa_id = 1 AND nome = 'Matriz');

INSERT INTO departamentos (empresa_id, unidade_id, nome, ativo) VALUES
(1, @matriz_id, 'Tecnologia da Informação', TRUE),
(1, @matriz_id, 'Administrativo', TRUE),
(1, @matriz_id, 'Frota', TRUE);

SET @ti_id = (SELECT id FROM departamentos WHERE empresa_id = 1 AND nome = 'Tecnologia da Informação' LIMIT 1);

INSERT INTO usuarios (
  empresa_id, codigo_funcionario, nome, email, telefone, unidade_id, departamento_id, ativo
) VALUES
(1, '13967', 'Usuário Administrador', 'admin@empresa-demo.local', '(16) 99999-9999', @matriz_id, @ti_id, TRUE),
(1, '14221', 'Carlos Silva', 'carlos@empresa-demo.local', '(16) 98888-1111', @matriz_id, @ti_id, TRUE),
(1, '15190', 'Mariana Souza', 'mariana@empresa-demo.local', '(16) 97777-2222', @matriz_id, @ti_id, TRUE);

SET @admin_id = (SELECT id FROM usuarios WHERE empresa_id = 1 AND email = 'admin@empresa-demo.local');
SET @carlos_id = (SELECT id FROM usuarios WHERE empresa_id = 1 AND email = 'carlos@empresa-demo.local');

INSERT INTO perfis (empresa_id, codigo, nome, descricao) VALUES
(1, 'COLABORADOR', 'Colaborador', 'Usuário padrão do sistema de reservas'),
(1, 'GESTOR', 'Gestor', 'Gestor com acesso às reservas da equipe'),
(1, 'FROTA', 'Frota', 'Equipe responsável pela operação da frota'),
(1, 'ADMIN', 'Administrador', 'Administrador completo do tenant');

INSERT INTO perfil_permissoes (empresa_id, perfil_id, permissao_id)
SELECT 1, p.id, pm.id
FROM perfis p
CROSS JOIN permissoes pm
WHERE p.empresa_id = 1 AND p.codigo = 'ADMIN';

INSERT INTO perfil_permissoes (empresa_id, perfil_id, permissao_id)
SELECT 1, p.id, pm.id
FROM perfis p
JOIN permissoes pm ON pm.codigo IN (
  'RESERVA_CRIAR','RESERVA_CRIAR_PARA_OUTRO','RESERVA_VISUALIZAR_PROPRIA','RESERVA_VISUALIZAR_TODAS',
  'RESERVA_EDITAR_TODAS','RESERVA_CANCELAR_TODAS','AGENDA_VISUALIZAR','AGENDA_GERAL_VISUALIZAR',
  'VEICULO_VISUALIZAR','VEICULO_CRIAR','VEICULO_EDITAR','VEICULO_INATIVAR','VEICULO_BLOQUEAR',
  'MANUTENCAO_VISUALIZAR','MANUTENCAO_GERENCIAR','USUARIO_VISUALIZAR','RELATORIO_VISUALIZAR',
  'GESTAO_DASHBOARD','ABASTECIMENTO_VISUALIZAR','ABASTECIMENTO_GERENCIAR','CUSTO_VISUALIZAR','CUSTO_GERENCIAR',
  'DOCUMENTO_VISUALIZAR','DOCUMENTO_GERENCIAR','MULTA_VISUALIZAR','MULTA_GERENCIAR'
)
WHERE p.empresa_id = 1 AND p.codigo = 'FROTA';

SET @admin_perfil = (SELECT id FROM perfis WHERE empresa_id = 1 AND codigo = 'ADMIN');
INSERT INTO usuario_perfis (empresa_id, usuario_id, perfil_id)
VALUES (1, @admin_id, @admin_perfil);

INSERT INTO categorias_veiculo (empresa_id, nome, descricao) VALUES
(1, 'Passeio', 'Veículo leve para transporte de passageiros'),
(1, 'Utilitário', 'Veículo destinado a serviços e transporte de materiais'),
(1, 'Pickup', 'Veículo com caçamba'),
(1, 'Van', 'Veículo para transporte de maior número de passageiros');

SET @cat_passeio = (SELECT id FROM categorias_veiculo WHERE empresa_id = 1 AND nome = 'Passeio');
SET @cat_utilitario = (SELECT id FROM categorias_veiculo WHERE empresa_id = 1 AND nome = 'Utilitário');
SET @cat_pickup = (SELECT id FROM categorias_veiculo WHERE empresa_id = 1 AND nome = 'Pickup');

INSERT INTO veiculos (
  empresa_id, codigo_interno, placa, marca, modelo, categoria_id, unidade_id, capacidade, cor, ano, km_atual
) VALUES
(1, 'DIS401', 'ABC1D23', 'Fiat', 'Strada', @cat_utilitario, @matriz_id, 2, 'Branca', 2025, 45382),
(1, 'MOB203', 'TJO8J81', 'Fiat', 'Mobi', @cat_passeio, @matriz_id, 5, 'Branco', 2024, 28810),
(1, 'ARG112', 'FGH4J56', 'Fiat', 'Argo', @cat_passeio, @matriz_id, 5, 'Prata', 2025, 19120),
(1, 'TOR078', 'KLM7N89', 'Fiat', 'Toro', @cat_pickup, @matriz_id, 5, 'Cinza', 2024, 51640);

SET @strada_id = (SELECT id FROM veiculos WHERE empresa_id = 1 AND codigo_interno = 'DIS401');
SET @mobi_id = (SELECT id FROM veiculos WHERE empresa_id = 1 AND codigo_interno = 'MOB203');
SET @argo_id = (SELECT id FROM veiculos WHERE empresa_id = 1 AND codigo_interno = 'ARG112');
SET @toro_id = (SELECT id FROM veiculos WHERE empresa_id = 1 AND codigo_interno = 'TOR078');

INSERT INTO centros_custo (empresa_id, codigo, nome, descricao) VALUES
(1, 'TI', 'Tecnologia da Informação', 'Deslocamentos e custos do departamento de TI'),
(1, 'ADM', 'Administrativo', 'Deslocamentos administrativos'),
(1, 'COM', 'Comercial', 'Visitas e atividades comerciais');

SET @cc_ti = (SELECT id FROM centros_custo WHERE empresa_id = 1 AND codigo = 'TI');
SET @cc_adm = (SELECT id FROM centros_custo WHERE empresa_id = 1 AND codigo = 'ADM');

INSERT INTO abastecimentos (
  empresa_id, veiculo_id, motorista_id, centro_custo_id, data_hora, quilometragem,
  tipo_combustivel, litros, valor_total, posto, registrado_por_id
) VALUES
(1, @strada_id, @admin_id, @cc_ti, DATE_SUB(NOW(), INTERVAL 4 DAY), 45190, 'Etanol', 42.300, 169.20, 'Posto Demonstração', @admin_id),
(1, @mobi_id, @carlos_id, @cc_adm, DATE_SUB(NOW(), INTERVAL 7 DAY), 28620, 'Gasolina', 35.800, 215.16, 'Posto Demonstração', @admin_id),
(1, @toro_id, @admin_id, @cc_ti, DATE_SUB(NOW(), INTERVAL 10 DAY), 51310, 'Diesel', 55.000, 341.00, 'Posto Demonstração', @admin_id);

INSERT INTO custos_veiculo (
  empresa_id, veiculo_id, centro_custo_id, categoria, descricao, data_custo, valor, registrado_por_id
) VALUES
(1, @strada_id, @cc_ti, 'PEDAGIO', 'Pedágios de viagem', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 42.60, @admin_id),
(1, @mobi_id, @cc_adm, 'LAVAGEM', 'Lavagem completa', DATE_SUB(CURDATE(), INTERVAL 6 DAY), 55.00, @admin_id);

INSERT INTO planos_manutencao (
  empresa_id, veiculo_id, nome, intervalo_km, intervalo_dias, ultimo_km, ultima_data, proximo_km, proxima_data
) VALUES
(1, @strada_id, 'Revisão periódica', 10000, 180, 40000, DATE_SUB(CURDATE(), INTERVAL 120 DAY), 50000, DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
(1, @toro_id, 'Troca de óleo', 10000, 180, 50000, DATE_SUB(CURDATE(), INTERVAL 170 DAY), 60000, DATE_ADD(CURDATE(), INTERVAL 10 DAY));

INSERT INTO documentos_veiculo (
  empresa_id, veiculo_id, tipo, numero, validade_em, alerta_dias, status, criado_por_id
) VALUES
(1, @strada_id, 'SEGURO', 'SEG-DEMO-001', DATE_ADD(CURDATE(), INTERVAL 22 DAY), 30, 'ATIVO', @admin_id),
(1, @mobi_id, 'LICENCIAMENTO', 'LIC-DEMO-002', DATE_ADD(CURDATE(), INTERVAL 75 DAY), 30, 'ATIVO', @admin_id);

INSERT INTO documentos_usuario (
  empresa_id, usuario_id, tipo, numero, categoria, validade_em, alerta_dias, status, criado_por_id
) VALUES
(1, @admin_id, 'CNH', '00000000000', 'AB', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 30, 'ATIVO', @admin_id);

INSERT INTO multas (
  empresa_id, veiculo_id, motorista_id, centro_custo_id, auto_infracao, data_hora_infracao,
  descricao, local_infracao, valor, pontos, vencimento_em, status, registrado_por_id
) VALUES
(1, @mobi_id, @carlos_id, @cc_adm, 'AI-DEMO-001', DATE_SUB(NOW(), INTERVAL 12 DAY),
 'Exemplo de infração para ambiente de desenvolvimento', 'Via de demonstração', 195.23, 5,
 DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'PENDENTE', @admin_id);
