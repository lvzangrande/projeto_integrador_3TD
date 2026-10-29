CREATE DATABASE IF NOT EXISTS water_control CHARACTER SET utf8mb4 COLLATE utf8mb4 COLLATE utf8mb4_unicode_ci;
USE water_control;

CREATE TABLE IF NOT EXISTS usuarios (
	id_cliente INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	telefone VARCHAR(20) NULL,
	cnpj VARCHAR(20) NOT NULL,
	categoria ENUM('admin', 'filiado', 'cliente') NOT NULL,
	tema ENUM('claro', 'escuro') DEFAULT 'escuro' NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT 'Ativo' NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservatorios(
	id_res INT PRIMARY KEY AUTO INCREMENT,
	nome VARCHAR(100),
	capacidade DECIMAL(15,3) NOT NULL,
	localizacao VARCHAR(255) NOT NULL,
	nivel_min DECIMAL(8,2) NOT NULL,
	nivel_max DECIMAL(15,2) NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT ativo
	tipo ENUM('Torre de resfriamento', 'Tanque de processo', 'Decantador', 'Reservatório de água bruta', 'Reservatório de agua tratada','Cisterna', 'Tanque elevado'),
	FOREIGN KEY (id_cliente) REFERENCES usuarios(id_cliente) ON DELETE CASCADE,
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS setores(
	id_setor INT PRIMARY KEY AUTO INCREMENT,
	nome VARCHAR(100) NOT NULL,
	consumo_max_dia DECIMAL(15,2) NOT NULL,
	status ENUM('ativo', 'inativo')
	uso_setor ENUM('Linha de produção', 'Torres de resfriamento/Caldeiras','Limpeza/Lavagem','Uso administrativo', 'Tratamento de efluentes','Agua de reúso')
	FOREIGN KEY (id_res) REFERENCES reservatorios(id_res) ON DELETE CASCADE,
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXIST medidores(
	id_med INT PRIMARY KEY AUTO_INCREMENT,
	num_serie VARCHAR(50) UNIQUE NOT NULL,
	tipo ENUM('Nível','Vazão','Hidrômetro'),
	origem ENUM('Real', 'Simulado')
	FOREIGN KEY(id_res) REFERENCES reservatorios(id_res) ON DELETE CASCADE,
	FOREIGN KEY (id_setor) REFERENCES setores(id_setor) ON DELETE CASCADE,
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS responsaveis(
	id_resp INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	funcao VARCHAR(50) NOT NULL,
	telefone VARCHAR(20) NOT NULL,
	email VARCHAR(100) NULL
	FOREIGN KEY cliente_id REFERENCES usuarios(cliente_id) ON DELETE CASCADE,
	FOREIGN KEY id_res REFERENCES reservatorios(id_res) ON DELETE CASCADE,
	FOREIGN KEY id_setor REFERENCES setores(id_setor) ON DELETE CASCADE,
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leituras(
	id_leitura INT PRIMARY KEY AUTO_INCREMENT,
	FOREIGN KEY id_med REFERENCES medidores(id_med) ON DELETE CASCADE,
	valor DECIMAL(15,3),
	momento_leitura DATETIME NOT NULL
	origem ENUM('Manual', 'Importada', 'Simulada') NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ocorrencias(
	id_oc INT PRIMARY KEY AUTO_INCREMENT,
	FOREIGN KEY id
)ENGINE=InnoDB;
