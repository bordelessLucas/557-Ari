# Ari

Projeto web com React, Vite, Tailwind CSS e Firebase.

## Stack

- **React 19** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS v4** — estilização
- **Firebase** — autenticação (Auth) e Analytics

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build de produção

```bash
npm run build
npm run preview
```

Os arquivos gerados ficam em `dist/`.

## Firebase

A autenticação usa e-mail e senha. No [Firebase Console](https://console.firebase.google.com/), ative **Authentication > Sign-in method > Email/Password** no projeto `ari-b0f40`.

## Estrutura

```
src/
├── lib/firebase.ts   # Configuração do Firebase
├── pages/
│   ├── Login.tsx     # Tela de login/cadastro
│   └── Home.tsx      # Tela após autenticação
└── App.tsx           # Roteamento por estado de auth
```
