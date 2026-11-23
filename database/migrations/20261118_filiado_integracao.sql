-- Execute uma vez em bancos que foram criados antes da integração da área do afiliado.
ALTER TABLE usuarios
  MODIFY senha VARCHAR(255) NOT NULL,
  ADD COLUMN documento VARCHAR(20) NULL AFTER cnpj,
  ADD COLUMN tipo_pessoa ENUM('fisica', 'juridica') NULL AFTER documento,
  ADD COLUMN id_filiado INT NULL AFTER status,
  ADD COLUMN criado_em DATETIME NULL DEFAULT NULL AFTER id_filiado,
  ADD CONSTRAINT fk_usuarios_filiado
    FOREIGN KEY (id_filiado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

UPDATE usuarios SET documento = cnpj, tipo_pessoa = 'juridica' WHERE documento IS NULL;
ALTER TABLE usuarios MODIFY criado_em DATETIME NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE usuarios ADD UNIQUE KEY uq_usuarios_documento (documento);

ALTER TABLE reunioes
  ADD COLUMN id_filiado INT NULL AFTER id_usuario,
  ADD CONSTRAINT fk_reunioes_filiado
    FOREIGN KEY (id_filiado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;
