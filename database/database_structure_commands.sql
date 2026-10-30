CREATE DATABASE IF NOT EXISTS db_water_control CHARACTER SET utf8mb4 COLLATE utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_water_control;

CREATE TABLE IF NOT EXISTS usuarios (
	id_usuario INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	cnpj VARCHAR(20) NOT NULL,
	telefone VARCHAR(20) NULL,
	categoria ENUM('admin', 'filiado', 'cliente') NOT NULL,
	tema ENUM('claro', 'escuro') DEFAULT 'escuro' NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT 'Ativo' NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservatorios(
	id_res INT PRIMARY KEY AUTO INCREMENT,
	nome VARCHAR(100) NOT NULL,
	capacidade DECIMAL(15,3) NOT NULL,
	localizacao VARCHAR(255) NOT NULL,
	nivel_min DECIMAL(8,2) NOT NULL,
	nivel_max DECIMAL(15,2) NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT ativo NOT NULL,
	tipo ENUM('Torre de resfriamento', 'Tanque de processo', 'Decantador', 'Reservatório de água bruta', 'Reservatório de agua tratada','Cisterna', 'Tanque elevado', 'Outro') NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS setores(
	id_setor INT PRIMARY KEY AUTO INCREMENT,
	nome VARCHAR(100) NOT NULL,
	consumo_max_dia DECIMAL(15,2) NOT NULL,
	status ENUM('ativo', 'inativo'),
	uso_setor ENUM('Linha de produção', 'Torres de resfriamento/Caldeiras','Limpeza/Lavagem','Uso administrativo', 'Tratamento de efluentes','Agua de reúso', 'Outro'),
	FOREIGN KEY (id_res) REFERENCES reservatorios(id_res) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXIST medidores(
	id_med INT PRIMARY KEY AUTO_INCREMENT,
	num_serie VARCHAR(50) UNIQUE NOT NULL,
	tipo ENUM('Nível','Vazão','Hidrômetro'),
	origem ENUM('Real', 'Simulado'),
	FOREIGN KEY(id_res) REFERENCES reservatorios(id_res) ON DELETE CASCADE NULL,
	FOREIGN KEY (id_setor) REFERENCES setores(id_setor) ON DELETE CASCADE NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS responsaveis(
	id_resp INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	funcao VARCHAR(50) NOT NULL,
	telefone VARCHAR(20) NOT NULL,
	email VARCHAR(100) NULL,
	FOREIGN KEY cliente_id REFERENCES usuarios(cliente_id) ON DELETE CASCADE,
	FOREIGN KEY id_res REFERENCES reservatorios(id_res) ON DELETE CASCADE NULL,
	FOREIGN KEY id_setor REFERENCES setores(id_setor) ON DELETE CASCADE NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leituras(
	id_leitura INT PRIMARY KEY AUTO_INCREMENT,
	valor DECIMAL(15,3),
	momento_leitura DATETIME NOT NULL,
	origem ENUM('Manual', 'Importada', 'Simulada') NOT NULL,
	FOREIGN KEY id_med REFERENCES medidores(id_med) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ocorrencias(
	id_oc INT PRIMARY KEY AUTO_INCREMENT,
	descricao_oc TEXT NOT NULL,
	volume_perdido DECIMAL(15,2) NULL,
	momento_abertura DATETIME NOT NULL
	status ENUM('Aberta', 'Em análise', 'Em reparo', 'Resolvida', 'Descartada')
	severidade ENUM('Baixa', 'Média', 'Alta', 'Extrema'),
	tipo ENUM('Vazamento visível', 'Vazamento Oculto', 'Consumo anormal', 'Falha de sensor', 'Transbordo', 'Outro'),
	FOREIGN KEY id_res REFERENCES reservatorios(id_res) ON DELETE CASCADE,
	FOREIGN KEY id_setor REFERENCES setores(id_setor) ON DELETE CASCADE NULL,
	FOREIGN KEY id_resp REFERENCES responsaveis(id_resp) ON DELETE CASCADE NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alertas(
	id_alerta INT PRIMARY KEY AUTO_INCREMENT,
	tipo_alerta

	FOREIGN KEY id_res REFERENCES reservatorios(id_res) ON DELETE CASCADE ,
	FOREIGN KEY id_oc REFERENCES ocorrencias(id_oc) ON DELETE CASCADE NULL,
	FOREIGN KEY id_med REFERENCES medidores(id_med) ON DELETE CASCADE NULL,
);
