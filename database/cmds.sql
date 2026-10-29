

CREATE DATABASE IF NOT EXISTS water_control CHARACTER SET utf8mb4 COLLATE utf8mb4 COLLATE utf8mb4_unicode_ci;
USE water_control;

CREATE TABLE IF NOT EXISTS usuarios (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	telefone VARCHAR(20) NULL,
	cnpj VARCHAR(20) NOT NULL,
	categoria ENUM('admin', 'filiado', 'cliente') NOT NULL,
	tema ENUM('claro', 'escuro') DEFAULT 'escuro' NOT NULL,
	status ENUM('ativo', 'inativo') DEFAULT 'Ativo' NOT NULL
);

CREATE TABLE IF NOT EXISTS reservatorio(
	id_res INT PRIMARY KEY AUTO INCREMENT,
	FOREIGN KEY (id_cliente) REFERENCES usuarios(id) ON DELETE CASCADE,
	nome VARCHAR(100),
	tipo ENUM('Torre de Resfriamento', 'Tanque de processo', 'Decantador', 'Reservatório de Água Bruta', 'Reservatório de Agua Tratada','Cisterna', 'Tanque Elevado'),
	capacidade_litros FLOAT(20)

);
