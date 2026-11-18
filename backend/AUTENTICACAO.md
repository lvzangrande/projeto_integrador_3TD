# Autenticacao da area do afiliado

A sessao usa um JWT HS256 assinado pelo backend e guardado em cookie `HttpOnly`; o token nao e exposto ao JavaScript do navegador. Configure um `JWT_SECRET` aleatorio, longo e estavel nos ambientes compartilhados. `COOKIE_SECURE=true` deve ser usado quando a aplicacao estiver publicada em HTTPS. O cookie usa `SameSite=Strict` por padrao; se frontend e backend estiverem em sites diferentes, configure `COOKIE_SAME_SITE=none` e `COOKIE_SECURE=true`.

As senhas novas usam `scrypt` do modulo nativo do Node.js, com salt aleatorio. Essa escolha evita adicionar uma dependencia nativa ao container e mantem o hash seguro no servidor. Contas do seed antigo, que ainda guardam senha em texto simples, sao migradas para scrypt no primeiro login valido; nao use essas credenciais de demonstracao em producao.

Em banco existente, aplique uma vez `database/migrations/20261118_filiado_integracao.sql`. O script inicial ja inclui as colunas em instalacoes novas.
