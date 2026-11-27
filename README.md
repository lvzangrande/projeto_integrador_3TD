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
npm install three @types/three @react-three/fiber @react-three/drei
npm install lenis
npm install chart.js react-chartjs-2 
```

2. Copie os arquivos de ambiente:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Suba o MySQL com Docker (se for rodar com XAMPP ou MySQL Community Server, ignorar passo):

```bash
docker compose up -d database
```

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
- Health check da API: `http://localhost:8080/api/health`
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
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
TWILIO_VERIFY_SERVICE_SID=
PASSWORD_RESET_TTL_MINUTES=5
```

Para a recuperação, o usuário informa o CPF e recebe por SMS um código de seis dígitos no telefone cadastrado. O backend usa Twilio Verify, que gera e confere o código; configure `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET` e `TWILIO_VERIFY_SERVICE_SID` em `backend/.env`. Use uma API key Standard e mantenha o segredo somente no backend. A solicitação expira localmente em cinco minutos; há limite de um pedido por conta a cada minuto e cinco pedidos por IP a cada 15 minutos. O hash da solicitação e os limites ficam em `backend/data/recuperacao-senha.json`.

O arquivo JSON é criado automaticamente, ignorado pelo Git e adequado para uma única instância local do backend. Em conta Trial, abra **Identity → Verify → Overview → Try out Verify**, conclua um teste para um telefone verificado e copie o SID real `VA...` da requisição de exemplo para `TWILIO_VERIFY_SERVICE_SID`. A página **Services** pode exigir upgrade para criar e administrar um serviço próprio. O Trial aceita somente destinatários verificados e usa um template fixo; consulte os [limites do Verify Trial](https://www.twilio.com/docs/usage/trials/try-out-verify).

A recuperacao por e-mail atualmente usa Mailtrap; as variaveis `GMAIL_*` listadas no Coolify nao sao consumidas pelo codigo. Em sandbox, `MAILTRAP_SANDBOX_ID` e obrigatorio. Para envio real, configure `MAILTRAP_USE_SANDBOX=false`, um token Mailtrap e um remetente verificado em `MAIL_FROM_EMAIL`.

No deploy Compose atual, as variaveis `TWILIO_*` nao sao encaminhadas ao ambiente de runtime do backend (passa-las como build args nao basta). Por isso, a opcao CPF/SMS nao funcionara no Coolify ate essas variaveis chegarem ao container em runtime. Nao alterei arquivos Docker.

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
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
TWILIO_VERIFY_SERVICE_SID=
PASSWORD_RESET_TTL_MINUTES=5
```

Para executar o backend fora do Docker, configure essas variáveis em `backend/.env`. O telefone Twilio usado como remetente deve estar no formato internacional E.164.

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
- `POST /api/auth/esqueci-senha` solicita um código SMS usando o CPF; `POST /api/auth/redefinir-senha` valida CPF e código e salva a nova senha.
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
Para atualizar bancos antigos, aplique uma vez `database/migrations/20261125_remover_alertas.sql`.

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

No deploy pelo `docker-compose.yml`, o frontend encaminha `/api` ao servico `backend` pela rede interna do Docker. Use `NEXT_PUBLIC_API_URL=/api` e configure `FRONTEND_URL` com a origem publica do frontend (por exemplo, `http://watercontrol.10.189.87.231.sslip.io`). O dominio publico do Coolify deve apontar para o servico frontend; nao e necessario expor a porta do backend ao navegador.

## Observacoes Para Alunos

- Nao versionar arquivos `.env`.
- Nao versionar `node_modules`, `.next` ou arquivos de build.
- Manter o backend em JavaScript.
- Instalar Tailwind ou Bootstrap apenas se o projeto precisar.
