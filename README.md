# Projeto Base Full Stack

Template para alunos criarem forks com a mesma stack de frontend, backend e banco de dados.

## Stack Padrao

- Frontend: Next.js `16.2.10` com JavaScript, sem Tailwind e sem Bootstrap por padrao.
- Backend: Node.js com Express em JavaScript.
- Banco de dados: MySQL.
- Deploy: Dockerfiles separados para frontend, backend e banco, facilitando criacao de servicos.

## Estrutura

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── database/
│   ├── init/
│   │   └── 01-schema.sql
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Como Rodar Localmente

1. Instale as dependencias:

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Configure as variaveis locais do backend e do frontend:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

No `backend/.env`, ajuste `DB_USER` e `DB_PASSWORD` para as credenciais do seu MySQL local.

3. Crie e popule o banco. No MySQL Workbench, execute nesta ordem:

- `database/init/01-schema.sql`
- `database/init/seed.sql`

O backend espera o banco `DB_water_control` na porta `3306`.

4. Rode o backend:

```bash
cd backend
npm run dev
```

5. Rode o frontend:

```bash
cd frontend
npm run dev
```

URLs padrao:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Rota base da API: `http://localhost:8080/`
- Recursos da API: `/usuario`, `/reservatorios`, `/setor`, `/medidores`, `/leituras`, `/ocorrencias` e `/reunioes`
- MySQL: `localhost:3306`

## Rodando Tudo com Docker Compose

```bash
docker compose up --build
```

Esse comando sobe:

- `frontend` na porta `3000` por padrao
- `backend` na porta `8080` por padrao
- `database` na porta `3306` por padrao

## Variaveis de Ambiente

Docker Compose raiz (`.env`):

```env
FRONTEND_HOST_PORT=3000
BACKEND_HOST_PORT=8080
DATABASE_HOST_PORT=3306

FRONTEND_PORT=3000
BACKEND_PORT=8080

FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api

MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=DB_water_control
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

DB_HOST=database
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=DB_water_control
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_SENDER=
PASSWORD_RESET_TTL_MINUTES=30
```

O envio de recuperação usa a Gmail API com OAuth 2.0. No Google Cloud, habilite a Gmail API e crie um cliente OAuth. Autorize a conta remetente com o escopo `https://www.googleapis.com/auth/gmail.send` e acesso offline; configure client ID, client secret, refresh token e o endereço da mesma conta em `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` e `GMAIL_SENDER`. Mantenha essas credenciais somente no backend. O refresh token precisa ser renovado se o consentimento for revogado ou expirar. Veja a [documentação OAuth para aplicações web](https://developers.google.com/identity/protocols/oauth2/web-server) e o [guia de envio da Gmail API](https://developers.google.com/workspace/gmail/api/guides/sending).

Para obter o refresh token, adicione `https://developers.google.com/oauthplayground` como redirect URI do cliente OAuth, abra o [OAuth Playground](https://developers.google.com/oauthplayground), habilite “Use your own OAuth credentials” nas configurações, informe o client ID e o client secret, autorize o escopo `gmail.send` com a conta remetente e troque o código por tokens. Se o consentimento OAuth externo estiver em modo de teste, o Google expira refresh tokens em sete dias para escopos Gmail; publique o consentimento ou renove o token conforme a política do projeto.

Para rodar varios grupos no mesmo servidor, mude pelo menos as portas publicadas no host e a URL publica da API. Exemplo para um segundo grupo:

```env
FRONTEND_HOST_PORT=3001
BACKEND_HOST_PORT=8081
DATABASE_HOST_PORT=3307
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

As portas internas podem continuar nos defaults (`FRONTEND_PORT=3000` e `BACKEND_PORT=8080`) na maioria dos casos. Altere as portas internas apenas se o Coolify ou a arquitetura escolhida exigirem.

Backend (`backend/.env`):

```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict

DB_HOST=localhost
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=DB_water_control
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_SENDER=
PASSWORD_RESET_TTL_MINUTES=30
```

Para executar o backend fora do Docker, copie essas variáveis para `backend/.env`. A conta configurada em `GMAIL_SENDER` deve ser a que concedeu o refresh token.

Frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

No Docker Compose, o backend usa `DB_HOST=database`, porque esse e o nome do servico MySQL na rede Docker.

## Backend

Scripts principais:

```bash
npm run dev
npm start
```

Rotas iniciais:

- `GET /` retorna uma mensagem basica da API.
- `GET /api/health` retorna status da API e testa a conexao com MySQL.
- `POST /api/auth/login`, `POST /api/auth/logout` e `GET /api/auth/me` controlam a sessao por cookie HTTPOnly.
- `POST /api/auth/esqueci-senha` solicita um link enviado pela Gmail API; `GET /api/auth/verificar-token-redefinicao` valida o link; `POST /api/auth/redefinir-senha` consome o token e salva a nova senha.
- `GET/POST /api/usuario` lista e cadastra clientes na carteira do afiliado autenticado.
- `GET/POST /api/reunioes` lista e registra encontros vinculados a um cliente da carteira.

Pastas padrao:

- `src/config`: configuracoes e conexoes externas.
- `src/controllers`: funcoes que tratam requisicoes.
- `src/routes`: definicao das rotas HTTP.
- `src/middlewares`: middlewares compartilhados.

## Frontend

Scripts principais:

```bash
npm run dev
npm run build
npm start
npm run lint
```

O projeto esta sem Tailwind e sem Bootstrap por padrao. Cada aluno pode instalar e configurar a biblioteca CSS escolhida conforme a necessidade do projeto.

## Banco de Dados

O container cria o banco indicado por `MYSQL_DATABASE`; `database/init/01-schema.sql` cria as tabelas nesse banco na primeira inicializacao.
Para bancos criados anteriormente, aplique uma vez `database/migrations/20261118_filiado_integracao.sql` antes de usar login, cadastro de clientes ou reunioes. Bancos novos recebem as colunas pela definicao inicial. O script nao tenta adivinhar a carteira dos clientes antigos: preencha `usuarios.id_filiado` e `reunioes.id_filiado` para associar esses registros aos afiliados corretos.

Para reiniciar o banco local do zero:

```bash
docker compose down -v
docker compose up -d database
```

## Deploy no Coolify

Crie servicos separados apontando para os Dockerfiles:

- Frontend: `frontend/Dockerfile`
- Backend: `backend/Dockerfile`
- Banco: preferencialmente use o servico gerenciado de MySQL do Coolify. Se quiser usar a imagem do repo, use `database/Dockerfile`.

Configure no Coolify as variaveis de ambiente equivalentes aos arquivos `.env.example`. No backend, `DB_HOST` deve apontar para o host/nome interno do servico MySQL no Coolify.

Para cada grupo, configure valores diferentes para:

- `FRONTEND_HOST_PORT`
- `BACKEND_HOST_PORT`
- `DATABASE_HOST_PORT`, se estiver publicando MySQL no host
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`

Em deploy com dominio/reverse proxy, `NEXT_PUBLIC_API_URL` deve apontar para a URL publica real do backend, por exemplo `https://api-grupo-01.seudominio.com/api`.

## Observacoes Para Alunos

- Nao versionar arquivos `.env`.
- Nao versionar `node_modules`, `.next` ou arquivos de build.
- Manter o backend em JavaScript.
- Instalar Tailwind ou Bootstrap apenas se o projeto precisar.
