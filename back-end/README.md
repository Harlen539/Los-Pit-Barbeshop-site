# Back-end Los Pit

API REST em Express com Prisma/PostgreSQL. Disponibilidade e confirmação são recalculadas no servidor; a criação usa transação serializável e a migração documenta a constraint PostgreSQL para impedir sobreposição também no banco.

## Comandos

```bash
npm run db:migrate -w back-end
npm run db:seed -w back-end
npm run dev -w back-end
```

Preencha `.env` a partir de `.env.example`. `ADMIN_EMAIL` e `ADMIN_PASSWORD` são opcionais e somente criam o primeiro administrador durante o seed.
