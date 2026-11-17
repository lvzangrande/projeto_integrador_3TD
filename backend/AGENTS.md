# Especificação de implementação da API WaterControl

## 1. Objetivo

Construir a API REST do sistema WaterControl no backend deste repositório, usando o que já foi implementado como base.

O documento de referência e a fonte de verdade dos requisitos são:

- `../documentation/documentacao_wapi_watercontrol.txt`
- `../database/init/01-schema.sql`
- `../database/init/seed.sql`

Esta especificação não autoriza substituir, apagar ou reescrever em outra linguagem uma base já funcional. A API deve evoluir incrementalmente dentro da estrutura atual.

## 2. Base existente obrigatória

Antes de criar qualquer módulo novo, preserve e reutilize:

- Runtime ESM já definido por `package.json` (`"type": "module"`).
- Entrypoint `src/server.js`.
- Aplicação Express existente em `src/app.js`.
- Pool MySQL existente em `src/config/database.js`.
- Validação de banco existente em `checkDatabaseConnection()`.
- Middlewares existentes em `src/middlewares/errorHandler.js`.
- Arquitetura em camadas já usada no módulo de exemplo:
  - model em `models/`
  - service em `services/`
  - controller em `src/controllers/`
  - routes em `src/routes/`
- Padrão atual de respostas:
  - sucesso: `{ sucesso: true, dados: ... }`
  - erro: `{ erro: "mensagem" }`
- Variáveis atuais do arquivo `.env` e o carregamento via `dotenv/config`.

O arquivo `models/Health*`, `services/HealthService.js`, `src/controllers/HealthController.js` e `src/routes/healthRoutes.js` são código base de referência, não a entidade final do sistema. Pode-se substituir ou ampliar esse módulo somente quando necessário, mantendo o padrão arquitetural.

Não usar `temporary_api/` como arquitetura definitiva. Os arquivos dessa pasta podem ser consultados apenas como código legado de referência; a implementação oficial deve continuar em `src/`.

Não remover o endpoint existente `GET /health` do registro atual. A estrutura final pode ampliá-lo, mas não quebrar sua disponibilidade.

## 3. Tecnologias e organização

Manter:

- Node.js
- Express 5
- `mysql2/promise`
- `dotenv`
- CORS
- Helmet
- ES Modules

Adicionar ao `package.json` somente dependências necessárias. Para autenticação, usar bcrypt para hashes e JWT para sessão, salvo decisão técnica diferente que esteja documentada e seja aplicada em todo o projeto.

Criar ou reutilizar a seguinte organização:

```text
backend/
  models/
  services/
  src/
    config/
    controllers/
    routes/
    middlewares/
  AGENTS.md
```

Não misturar SQL diretamente em controllers ou routes. Cada domínio deve ter model, service e controller; routes apenas expõem os handlers.

## 4. Fonte de dados

Usar MySQL por meio de `pool`.

Antes de implementar, reconciliar com cautela:

- A documentação descreve nomes e relações lógicas mais completos.
- Os scripts SQL existentes possuem nomes e tipos parcialmente diferentes.
- `01-schema.sql` usa convenções como `id_usuario`, `id_reservatorio`, `id_med`, enquanto outros scripts podem variar.
- Não presumir que todas as 11 tabelas documentadas já existam corretamente ou estejam migradas.

O agente implementador deve:

1. Examinar os scripts SQL reais.
2. Identificar o esquema efetivamente usado pelo ambiente.
3. Criar migrations compatíveis quando uma tabela/campo estiver ausente ou divergente.
4. Não renomear chaves existentes silenciosamente.
5. Registrar a estratégia adotada para resolver divergências.

## 5. Entidades e módulos mínimos

Implementar no backend todos os módulos necessários para os requisitos obrigatórios:

1. Auth e usuários
2. Reservatórios
3. Setores
4. Medidores
5. Responsáveis
6. Leituras
7. Ocorrências
8. Alertas
9. Reuniões/entrevistas
10. Tarifas
11. Histórico de acessos
12. Dashboard e indicadores
13. Relatórios

Cada módulo deve manter CRUD conforme o requisito, exceto leituras: o Admin pode consultar o histórico, mas não criar, alterar ou excluir leituras. Leituras não podem ser apagadas.

## 6. Contratos REST esperados

Usar rotas REST em plural e preservar o prefixo `/api` quando o frontend solicitar, se já houver configuração compatível:

- `/api/auth`
- `/api/usuarios`
- `/api/reservatorios`
- `/api/setores`
- `/api/medidores`
- `/api/responsaveis`
- `/api/leituras`
- `/api/ocorrencias`
- `/api/alertas`
- `/api/reunioes`
- `/api/tarifas`
- `/api/acessos`
- `/api/dashboard`
- `/api/relatorios`

Endpoints obrigatórios mínimos:

```text
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/redefinir-senha

GET    /api/usuarios
POST   /api/usuarios
GET    /api/usuarios/:id
PUT    /api/usuarios/:id
PATCH  /api/usuarios/:id/status
PATCH  /api/usuarios/:id/perfil
DELETE /api/usuarios/:id

GET    /api/reservatorios
POST   /api/reservatorios
GET    /api/reservatorios/:id
PUT    /api/reservatorios/:id
DELETE /api/reservatorios/:id
```

Repetir o padrão GET/POST/GET/:id/PUT/:id/DELETE/:id nos demais recursos CRUD.

Para alertas:

```text
PATCH /api/alertas/:id/reconhecer
```

Para ocorrências:

```text
PATCH /api/ocorrencias/:id/status
```

O ciclo permitido da ocorrência é:

```text
Aberta -> Em análise -> Em reparo -> Resolvida
```

ou:

```text
Aberta -> Descartada
```

A transição para `Resolvida` exige `acao_corretiva`.

Para leituras, os filtros devem usar pelo menos `id_med`, `id_reservatorio`, `id_setor`, `origem`, `data_inicio` e `data_fim`.

Leitura e simulação devem criar registros históricos; não devem permitir PUT/PATCH/DELETE.

## 7. Perfis, autenticação e autorização

Implementar três perfis:

- `admin`
- `filiado`
- `cliente`

Não existe autocadastro. Usuários novos devem ser criados pelo Admin ou pelo Filiado.

Um Filiado só pode acessar clientes cadastrados por ele, conforme `id_filiado`.

Um Cliente só pode acessar reservatórios, setores, medidores, responsáveis, leituras, ocorrências, alertas e relatórios próprios.

O Admin possui visão global, exceto que não altera ou exclui leituras.

Cada login, falha ou logout bem-sucedido gera registro em `acessos`, incluindo IP quando disponível.

Senhas nunca devem aparecer em respostas nem logs. Armazená-las com hash. O campo legado pode ter tamanho inadequado; aumentar no banco para pelo menos 255 caracteres.

Implementar middleware de autenticação e middleware por categoria/permissão.

Não aceitar tokens/cookies de sessão no frontend como variáveis simples sem proteção adequada.

## 8. Validações obrigatórias

Validar no service, não apenas no controller:

- Email válido, único e máximo de 100 caracteres.
- CPF/CNPJ único, quando presentes, válido e máximo de 20 caracteres.
- `nivel_min < nivel_max <= capacidade_l` em litros.
- Todo medidor vinculado a um reservatório ou setor ativo.
- Não criar medidor com número de série duplicado.
- Status e enumerações conforme documentação.
- Limites positivos.
- Datas futuras não são permitidas em leituras.
- Hidrômetro não pode ser menor que a leitura anterior acumulada.
- Ocorrência resolvida exige ação corretiva.
- Reunião exige cliente e Filiado.
- ID positivo inteiro em parâmetros.
- Corpo vazio ou campos não permitidos deve gerar erro 400.
- Dados ausentes em recurso obrigatório deve gerar erro 400.

## 9. Regras de exclusão

Usar exclusão lógica para entidades históricas:

- usuários
- reservatórios
- setores
- medidores
- responsáveis

Alterar `status` para `Inativo`, nunca deletar fisicamente esses registros.

Leituras são imutáveis: não criar PUT/PATCH/DELETE.

Alertas e ocorrências seguem fluxo próprio, não devem ser excluídos fisicamente.

Usar transações quando houver criação/atualização com múltiplas tabelas.

## 10. Regras de alerta

Gerar alerta automático quando houver:

- nível mínimo atingido
- nível máximo excedido
- consumo excedido por setor
- anomalia detectada

Não gerar alerta duplicado enquanto existir alerta ativo do mesmo tipo e local.

Status de alerta permitido:

- `Ativo`
- `Reconhecido`
- `Resolvido`

Uma ocorrência deve relacionar-se opcionalmente a um alerta e vice-versa conforme a modelagem existente.

## 11. Dashboard e cálculos

Implementar:

```text
GET /api/dashboard/resumo
GET /api/dashboard/consumo
GET /api/dashboard/nivel
GET /api/dashboard/economia
```

O resumo deve conter pelo menos:

- nível atual agregado
- alertas ativos
- ocorrências abertas
- consumo de referência
- consumo real
- economia de água
- economia financeira

Usar:

- Economia de água = consumo de referência - consumo real.
- Economia financeira = economia de água × tarifa vigente.
- Resultado negativo deve ser tratado como consumo acima da referência, não como economia positiva.
- Perda por vazamento estimada = vazão × duração.

Dashboard adaptado ao perfil:

- Admin vê visão global.
- Filiado vê sua carteira.
- Cliente vê sua operação.

Fuso horário `America/Sao_Paulo`, unidades em litros/m³, data brasileira e moeda brasileira.

## 12. Relatórios

Implementar relatórios de:

- consumo
- ocorrências
- economia

Exportar em `.txt` com endpoint ou parâmetro explícito, por exemplo:

```text
GET /api/relatorios/consumo.txt
GET /api/relatorios/ocorrencias.txt
GET /api/relatorios/economia.txt
```

Os relatórios devem aplicar os mesmos filtros e isolamento por perfil usados pelas consultas normais.

## 13. Respostas HTTP e erros

Usar status HTTP coerentes:

- `200` busca/listagem/atualização
- `201` criação
- `204` operação sem corpo
- `400` validação ou dados inválidos
- `401` não autenticado
- `403` sem permissão ou usuário inativo
- `404` recurso inexistente
- `409` conflito e duplicidade
- `500` erro interno

Manter o middleware central de erros. Não expor stack, SQL ou credenciais em respostas.

Para erros conhecidos, não deixar o controller acessar detalhes internos do banco.

## 14. Segurança

- Nunca armazenar senha em texto puro.
- Hash de senha nunca deve ser devolvido.
- Bloquear SQL construction a partir de campos arbitrários.
- Validar `origin` do CORS.
- Usar Helmet.
- Parametrizar todas as queries.
- Validar entrada com limites de tamanho.
- Registrar login, logout e falha de login.
- Aplicar autorização no backend; não confiar em dados enviados pelo frontend.
- Usar variáveis `.env` e não commitar segredos.

## 15. Convenções de código

- Código e nomes técnicos em inglês podem ser mantidos no padrão já existente.
- Mensagens e enums persistidos devem seguir os textos da documentação em português, exceto quando a tabela atual exigir outra grafia.
- Usar `async/await`.
- Validar número de ID com inteiro positivo.
- Usar classes ou funções model seguindo `criarHealthModel({ pool })`.
- Não usar `DELETE` físico em entidades históricas.
- Não adicionar lógica de banco diretamente nas routes.
- Encapsular erros de domínio em classes ou tipos próprios, evitando comparação por texto quando possível.
- Usar transações para operações compostas.

## 16. Ordem de implementação obrigatória

1. Corrigir/reconciliar schema e pool.
2. Implementar health/auth/usuários.
3. Implementar histórico de acessos.
4. Implementar reservatórios, setores, medidores e responsáveis.
5. Implementar leituras, validações e histórico.
6. Implementar ocorrências e alertas.
7. Implementar reuniões, tarifas e isolamento por perfil.
8. Implementar dashboard, economia e relatórios.
9. Adicionar testes básicos dos módulos e endpoints críticos.
10. Validar com `npm run dev` e consultas ao banco.

Não iniciar pelo frontend. Não iniciar por outra API paralela. Não trocar Express por outro framework.

## 17. Critérios de conclusão

A implementação será considerada concluída quando:

- todos os módulos obrigatórios estiverem montados em `src/app.js`;
- não houver chamadas SQL em controllers;
- todas as entidades tiverem validação e autorização adequadas;
- usuários não puderem acessar dados fora de sua carteira;
- leituras forem somente consultáveis pelo Admin;
- entidades históricas tiverem exclusão lógica;
- login registrar sucesso, falha e logout;
- senha estiver com hash;
- dashboard e relatórios funcionarem;
- `.env` e banco forem documentados sem expor credenciais reais;
- `npm start` subir o servidor;
- `npm run dev` continuar funcionando;
- os scripts SQL atuais forem compatíveis com a API ou forem tratados por migrations.
