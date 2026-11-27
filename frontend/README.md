# Frontend

Aplicacao Next.js do template base.

## Comandos

```bash
npm install
npm install three @types/three @react-three/fiber @react-three/drei
npm install lenis
npm install chart.js react-chartjs-2 
npm run dev
npm run build
npm start
npm run lint
```

## Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Variavel principal:

```env
NEXT_PUBLIC_API_URL=/api
```

In production, the browser uses the frontend's public domain and the Next.js
server proxies `/api` to the `backend` service over the Docker network. Keep
`NEXT_PUBLIC_API_URL=/api` and set the backend's `FRONTEND_URL` to the
frontend's public origin so its CORS policy accepts browser requests.

As instrucoes completas do projeto ficam no `README.md` da raiz.
