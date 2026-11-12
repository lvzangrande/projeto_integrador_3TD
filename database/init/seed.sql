use DB_water_control

-- ============================================
-- POVOAMENTO DO BANCO DE DADOS
-- SISTEMA DE GESTÃO HÍDRICA
-- 10 REGISTROS POR TABELA
-- ============================================

-- 1. USUARIOS

INSERT INTO usuarios (nome, email, senha, cnpj, telefone, categoria, tema, status) VALUES
('Administrador Sistema', 'admin@hidrogestao.com', '12345678901234567890123456789012', '12.345.678/0001-90', '(11) 99999-1001', 'Admin', 'Escuro', 'Ativo'),
('Carlos Mendes', 'carlos@empresa.com', '12345678901234567890123456789012', '23.456.789/0001-01', '(11) 99999-1002', 'Filiado', 'Claro', 'Ativo'),
('Ana Oliveira', 'ana@empresa.com', '12345678901234567890123456789012', '34.567.890/0001-12', '(11) 99999-1003', 'Filiado', 'Escuro', 'Ativo'),
('Roberto Santos', 'roberto@empresa.com', '12345678901234567890123456789012', '45.678.901/0001-23', '(21) 99999-1004', 'Cliente', 'Claro', 'Ativo'),
('Mariana Costa', 'mariana@empresa.com', '12345678901234567890123456789012', '56.789.012/0001-34', '(31) 99999-1005', 'Cliente', 'Escuro', 'Ativo'),
('Fernanda Lima', 'fernanda@empresa.com', '12345678901234567890123456789012', '67.890.123/0001-45', '(41) 99999-1006', 'Filiado', 'Claro', 'Inativo'),
('Pedro Almeida', 'pedro@empresa.com', '12345678901234567890123456789012', '78.901.234/0001-56', '(51) 99999-1007', 'Cliente', 'Escuro', 'Ativo'),
('Juliana Ferreira', 'juliana@empresa.com', '12345678901234567890123456789012', '89.012.345/0001-67', '(19) 99999-1008', 'Cliente', 'Claro', 'Ativo'),
('Lucas Rodrigues', 'lucas@empresa.com', '12345678901234567890123456789012', '90.123.456/0001-78', '(11) 99999-1009', 'Filiado', 'Escuro', 'Ativo'),
('Patricia Souza', 'patricia@empresa.com', '12345678901234567890123456789012', '10.234.567/0001-89', '(27) 99999-1010', 'Cliente', 'Claro', 'Inativo');


-- 2. RESERVATORIOS
INSERT INTO reservatorios
(id_usuario, nome, capacidade, localizacao, nivel_min, nivel_max, status, tipo)
VALUES
(2, 'Reservatório Principal', 50000.000, 'Rua Industrial 120, São Paulo - SP', 500.00, 45000.00, 'Ativo', 'Reservatório de água bruta'),
(2, 'Tanque de Produção A', 15000.000, 'Rua Industrial 150, São Paulo - SP', 200.00, 14000.00, 'Ativo', 'Tanque de processo'),
(3, 'Reservatório de Água Tratada', 30000.000, 'Av. Central 450, Campinas - SP', 300.00, 28000.00, 'Ativo', 'Reservatório de agua tratada'),
(3, 'Cisterna Norte', 10000.000, 'Rua das Flores 80, Campinas - SP', 100.00, 9000.00, 'Ativo', 'Cisterna'),
(4, 'Torre de Resfriamento 01', 20000.000, 'Av. Brasil 200, Rio de Janeiro - RJ', 500.00, 18000.00, 'Ativo', 'Torre de resfriamento'),
(5, 'Tanque Elevado Central', 12000.000, 'Rua das Palmeiras 300, Belo Horizonte - MG', 200.00, 11000.00, 'Ativo', 'Tanque elevado'),
(7, 'Decantador Principal', 25000.000, 'Rua da Estação 90, Porto Alegre - RS', 400.00, 23000.00, 'Ativo', 'Decantador'),
(8, 'Reservatório Secundário', 18000.000, 'Av. Industrial 700, Sorocaba - SP', 300.00, 16000.00, 'Ativo', 'Reservatório de água bruta'),
(9, 'Tanque de Reúso', 8000.000, 'Rua das Indústrias 50, São Paulo - SP', 100.00, 7500.00, 'Ativo', 'Tanque de processo'),
(10, 'Reservatório Antigo', 5000.000, 'Rua do Comércio 100, Vitória - ES', 100.00, 4500.00, 'Inativo', 'Cisterna');


-- 3. SETORES
INSERT INTO setores
(id_reservatorio, nome, consumo_max_dia, status, tipo)
VALUES
(1, 'Linha de Produção Principal', 12000.00, 'Ativo', 'Linha de produção'),
(1, 'Limpeza Industrial', 3000.00, 'Ativo', 'Limpeza/Lavagem'),
(2, 'Processamento Químico', 5000.00, 'Ativo', 'Linha de produção'),
(3, 'Distribuição Interna', 8000.00, 'Ativo', 'Uso administrativo'),
(4, 'Lavagem de Equipamentos', 2000.00, 'Ativo', 'Limpeza/Lavagem'),
(5, 'Sistema de Resfriamento', 9000.00, 'Ativo', 'Torres de resfriamento/Caldeiras'),
(6, 'Uso Administrativo', 1500.00, 'Ativo', 'Uso administrativo'),
(7, 'Tratamento de Efluentes', 4000.00, 'Ativo', 'Tratamento de efluentes'),
(8, 'Sistema de Reúso', 3500.00, 'Ativo', 'Agua de reúso'),
(9, 'Produção Secundária', 2500.00, 'Inativo', 'Linha de produção');


-- 4. MEDIDORES
INSERT INTO medidores
(id_setor, num_serie, tipo, origem)
VALUES
(1, 'MED-001', 'Vazão', 'Real'),
(1, 'MED-002', 'Nível', 'Real'),
(2, 'MED-003', 'Hidrômetro', 'Real'),
(3, 'MED-004', 'Vazão', 'Simulado'),
(4, 'MED-005', 'Nível', 'Real'),
(5, 'MED-006', 'Hidrômetro', 'Real'),
(6, 'MED-007', 'Vazão', 'Simulado'),
(7, 'MED-008', 'Nível', 'Real'),
(8, 'MED-009', 'Hidrômetro', 'Real'),
(9, 'MED-010', 'Vazão', 'Simulado');


-- 5. RESPONSAVEIS
INSERT INTO responsaveis
(id_usuario, id_reservatorio)
VALUES
(2, 1),
(2, 2),
(3, 3),
(3, 4),
(4, 5),
(5, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);


-- 6. LEITURAS
INSERT INTO leituras
(id_med, volume_leitura, momento_leitura, origem)
VALUES
(1, 1250.500, '2026-10-28 08:00:00', 'Manual'),
(1, 1380.750, '2026-10-28 12:00:00', 'Importada'),
(2, 32000.000, '2026-10-28 08:30:00', 'Manual'),
(3, 850.250, '2026-10-28 09:00:00', 'Importada'),
(4, 2100.000, '2026-10-28 10:00:00', 'Simulada'),
(5, 18000.500, '2026-10-28 11:00:00', 'Manual'),
(6, 950.750, '2026-10-28 13:00:00', 'Importada'),
(7, 750.000, '2026-10-28 14:00:00', 'Simulada'),
(8, 15000.250, '2026-10-28 15:00:00', 'Manual'),
(9, 1100.500, '2026-10-28 16:00:00', 'Importada');


-- 7. OCORRENCIAS
INSERT INTO ocorrencias
(id_reservatorio, id_setor, descricao, momento_abertura, volume_perdido, status, severidade, tipo)
VALUES
(1, 1, 'Identificado vazamento próximo à tubulação principal da linha de produção.', '2026-10-20 08:30:00', 150.00, 'Aberta', 'Alta', 'Vazamento visível'),
(1, 2, 'Consumo acima da média registrado durante o período noturno.', '2026-10-21 10:00:00', 80.00, 'Em análise', 'Média', 'Consumo anormal'),
(2, 3, 'Possível vazamento oculto na tubulação subterrânea.', '2026-10-21 14:20:00', 320.00, 'Em reparo', 'Alta', 'Vazamento Oculto'),
(3, 4, 'Sensor apresentou leituras inconsistentes de nível.', '2026-10-22 09:15:00', 0.00, 'Aberta', 'Média', 'Falha de sensor'),
(4, 5, 'Transbordamento identificado após falha no controle automático.', '2026-10-22 16:40:00', 500.00, 'Resolvida', 'Extrema', 'Transbordo'),
(5, 6, 'Vazamento visível em conexão da torre de resfriamento.', '2026-10-23 11:30:00', 210.00, 'Em reparo', 'Alta', 'Vazamento visível'),
(6, 7, 'Consumo administrativo acima do limite diário estabelecido.', '2026-10-24 08:00:00', 45.00, 'Descartada', 'Baixa', 'Consumo anormal'),
(7, 8, 'Falha de leitura identificada no sistema de monitoramento.', '2026-10-25 13:10:00', 0.00, 'Em análise', 'Média', 'Falha de sensor'),
(8, 9, 'Perda de água identificada durante inspeção de rotina.', '2026-10-26 10:45:00', 125.00, 'Resolvida', 'Alta', 'Vazamento Oculto'),
(9, 10, 'Pequeno vazamento identificado na tubulação de alimentação.', '2026-10-27 15:20:00', 30.00, 'Aberta', 'Baixa', 'Outro');


-- 8. REUNIOES
INSERT INTO reunioes
(id_usuario, momento_abertura, pauta, resumo, proximos_passos, tipo)
VALUES
(1, '2026-10-01 09:00:00', 'Reunião de alinhamento geral', 'Discussão sobre o andamento do sistema de monitoramento hídrico.', 'Definir prioridades e acompanhar o desenvolvimento.', 'Reunião'),
(2, '2026-10-03 10:00:00', 'Análise de consumo industrial', 'Foram avaliados os indicadores de consumo dos reservatórios.', 'Implementar medidas para redução do consumo.', 'Reunião'),
(3, '2026-10-05 14:00:00', 'Entrevista com responsável técnico', 'Entrevista para levantamento dos processos de abastecimento.', 'Documentar os processos identificados.', 'Entrevista'),
(4, '2026-10-07 11:00:00', 'Análise de vazamentos', 'Foram discutidas ocorrências de vazamentos nas instalações.', 'Realizar inspeção nas tubulações.', 'Reunião'),
(5, '2026-10-10 09:30:00', 'Planejamento de manutenção', 'Planejamento das próximas manutenções preventivas.', 'Criar cronograma de manutenção.', 'Reunião'),
(6, '2026-10-12 15:00:00', 'Entrevista com operador', 'Levantamento das dificuldades encontradas pelos operadores.', 'Avaliar melhorias na operação.', 'Entrevista'),
(7, '2026-10-15 13:00:00', 'Indicadores de eficiência hídrica', 'Análise dos indicadores de eficiência e desperdício.', 'Gerar relatório comparativo mensal.', 'Reunião'),
(8, '2026-10-18 10:30:00', 'Implantação de medidores', 'Discussão sobre a implantação de novos medidores.', 'Definir pontos de instalação.', 'Reunião'),
(9, '2026-10-22 16:00:00', 'Monitoramento de reservatórios', 'Avaliação do funcionamento dos sensores e equipamentos.', 'Verificar possíveis falhas de comunicação.', 'Reunião'),
(10, '2026-10-28 09:00:00', 'Resultados mensais', 'Apresentação dos resultados de consumo e ocorrências.', 'Preparar relatório para o próximo período.', 'Reunião');

