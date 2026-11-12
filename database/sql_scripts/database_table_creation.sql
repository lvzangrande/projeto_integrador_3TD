CREATE TABLE IF NOT EXISTS usuarios(
	id_usuario INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(80) NOT NULL, -- verify to see if hash characters won't be too low
	cnpj VARCHAR(20) NOT NULL,
	telefone VARCHAR(20) NULL,
	categoria ENUM('Admin', 'Filiado', 'Cliente') DEFAULT 'Cliente' NOT NULL,
	tema ENUM('Claro', 'Escuro') DEFAULT 'Escuro' NOT NULL,
	status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo' NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservatorios(
	id_reservatorio INT PRIMARY KEY AUTO_INCREMENT,
	id_usuario INT,
	nome VARCHAR(100) NOT NULL,
	capacidade DECIMAL(15,3) NOT NULL,
	localizacao VARCHAR(255) NOT NULL, -- would need another table or more columns to be properly described 
	nivel_min DECIMAL(8,2) NOT NULL,
	nivel_max DECIMAL(15,2) NOT NULL,
	status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo' NOT NULL,
	tipo ENUM('Torre de resfriamento', 'Tanque de processo', 'Decantador', 'Reservatório de água bruta', 'Reservatório de agua tratada','Cisterna', 'Tanque elevado', 'Outro') NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS setores(
	id_setor INT PRIMARY KEY AUTO_INCREMENT,
	id_reservatorio INT,
	nome VARCHAR(100) NOT NULL,
	consumo_max_dia DECIMAL(15,2) NOT NULL,
	status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo' NOT NULL,
	tipo ENUM('Linha de produção', 'Torres de resfriamento/Caldeiras','Limpeza/Lavagem','Uso administrativo', 'Tratamento de efluentes','Agua de reúso', 'Outro') NOT NULL,
	FOREIGN KEY (id_reservatorio) REFERENCES reservatorios(id_reservatorio) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medidores(
	id_medidor INT PRIMARY KEY AUTO_INCREMENT,
	id_setor INT,
	num_serie VARCHAR(50) UNIQUE NOT NULL,
	tipo ENUM('Nível','Vazão','Hidrômetro') NOT NULL,
	origem ENUM('Real', 'Simulado') DEFAULT 'Real' NOT NULL,
	FOREIGN KEY (id_setor) REFERENCES setores(id_setor) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS responsaveis(
	id_responsavel INT PRIMARY KEY AUTO_INCREMENT,
	id_usuario INT,
	id_reservatorio INT,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
	FOREIGN KEY (id_reservatorio) REFERENCES reservatorios(id_reservatorio) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leituras(
	id_leitura INT PRIMARY KEY AUTO_INCREMENT,
	id_medidor INT,
	volume_leitura DECIMAL(15,3) NOT NULL,
	momento_leitura DATETIME NOT NULL,
	origem ENUM('Manual', 'Importada', 'Simulada') NOT NULL,
	FOREIGN KEY (id_medidor) REFERENCES medidores(id_medidor) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ocorrencias(
	id_oc INT PRIMARY KEY AUTO_INCREMENT,
	id_reservatorio INT,
	id_setor INT,
	descricao TEXT NOT NULL,
	momento_abertura DATETIME NOT NULL,
	volume_perdido DECIMAL(15,2) NOT NULL,
	status ENUM('Aberta', 'Em análise', 'Em reparo', 'Resolvida', 'Descartada') NOT NULL,
	severidade ENUM('Baixa', 'Média', 'Alta', 'Extrema') NOT NULL,
	tipo ENUM('Vazamento visível', 'Vazamento Oculto', 'Consumo anormal', 'Falha de sensor', 'Transbordo', 'Outro') NOT NULL,
	FOREIGN KEY (id_reservatorio) REFERENCES reservatorios(id_reservatorio) ON DELETE CASCADE,
	FOREIGN KEY (id_setor) REFERENCES setores(id_setor) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reunioes(
	id_reuniao INT PRIMARY KEY AUTO_INCREMENT,
	id_usuario INT,
	momento_abertura DATETIME NOT NULL,
	pauta VARCHAR(255) NOT NULL,
	resumo TEXT NOT NULL,
	proximos_passos TEXT NULL,
	tipo ENUM('Reunião', 'Entrevista') DEFAULT 'Reunião' NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
)ENGINE=InnoDB;

