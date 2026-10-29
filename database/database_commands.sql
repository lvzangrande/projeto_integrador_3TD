

CREATE DATABASE IF NOT EXISTS water_control CHARACTER SET utf8mb4 COLLATE utf8mb4 COLLATE utf8mb4_unicode_ci;
USE water_control;

CREATE TABLE IF NOT EXISTS usuarios (
	id_usuario INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	telefone VARCHAR(20) NULL,
	cnpj VARCHAR(20) NOT NULL,
	categoria ENUM('admin', 'filiado', 'cliente') NOT NULL,
	tema ENUM('claro', 'escuro') DEFAULT 'escuro' NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT 'Ativo' NOT NULL
);

CREATE TABLE IF NOT EXISTS reservatorios(
	id_res INT PRIMARY KEY AUTO INCREMENT,
	FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
	nome VARCHAR(100),
	tipo ENUM('Torre de resfriamento', 'Tanque de processo', 'Decantador', 'Reservatório de água bruta', 'Reservatório de Agua Tratada','Cisterna', 'Tanque Elevado'),
	capacidade DECIMAL(15,3) NOT NULL,
	localizacao VARCHAR(255) NOT NULL,
	nivel_min DECIMAL(8,2) NOT NULL,
	nivel_max DECIMAL(15,2) NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT ativo
);

CREATE TABLE IF NOT EXISTS setores(
	id_setor INT PRIMARY KEY AUTO INCREMENT,
	FOREIGN KEY (id_res) REFERENCES reservartorios(id_res) ON DELETE CASCADE,
	nome VARCHAR(100) NOT NULL,
	uso_setor ENUM('Linha de produção', 'Torres de resfriamento')
);
