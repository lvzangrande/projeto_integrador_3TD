

CREATE DATABASE IF NOT EXISTS water_control CHARACTER SET utf8mb4 COLLATE utf8mb4 COLLATE utf8mb4_unicode_ci;
USE water_control;

CREATE TABLE IF NOT EXISTS usuarios (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	telefone VARCHAR(20) NULL,
	cnpj VARCHAR(20) NOT NULL,
	categoria size ENUM('admin', 'filiado', 'cliente') NOT NULL,
	tema size ENUM('claro', 'escuro') DEFAULT 'escuro'
	status ENUM('Ativo', 'inativo') DEFAULT 'Ativo'
);

CREATE TABLE IF NOT EXISTS are(

);
