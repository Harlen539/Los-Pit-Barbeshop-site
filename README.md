# Los Pit Barber Shop

Plataforma completa de apresentação e agendamento, organizada em dois projetos independentes:

- `front-end/`: React, Vite e TypeScript.
- `back-end/`: Express, Prisma, PostgreSQL e autenticação JWT.

## Desenvolvimento

1. Copie os arquivos `.env.example` de cada aplicação para `.env`.
2. Configure `DATABASE_URL` e execute `npm install`.
3. Rode `npm run db:migrate -w back-end` e `npm run db:seed -w back-end`.
4. Inicie tudo com `npm run dev`.

Consulte os READMEs de cada pasta para detalhes e variáveis obrigatórias.
