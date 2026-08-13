<div align="center">

<a href="https://lospit-barbeshop.vercel.app/">
  <img src="./front-end/public/assets/los-pit/logo/logo-los-pit.png" alt="Los Pit Barber Shop" width="220"/>
</a>

# 💈 Los Pit Barber Shop

### Barbearia, estilo e tecnologia em uma experiência completa de agendamento.

[![Site](https://img.shields.io/badge/🌐_Acessar_Site-Los_Pit-000000?style=for-the-badge)](https://lospit-barbeshop.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Harlen539-181717?style=for-the-badge\&logo=github)](https://github.com/Harlen539/Los-Pit-Barbeshop-site)

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square\&logo=react\&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square\&logo=vite\&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square\&logo=express\&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-22-339933?style=flat-square\&logo=nodedotjs\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square\&logo=prisma\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square\&logo=postgresql\&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square\&logo=vercel\&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

</div>

---

## ✂️ Sobre o projeto

O **Los Pit Barber Shop** é uma plataforma web **full stack** desenvolvida para modernizar a experiência de uma barbearia, unindo uma identidade visual marcante a um sistema completo de **serviços, profissionais e agendamentos online**.

O projeto vai além de uma landing page: possui **API própria, autenticação, banco de dados PostgreSQL, gerenciamento de horários, usuários, profissionais e agendamentos**.

A aplicação foi organizada como um **monorepo utilizando npm workspaces**, mantendo front-end e back-end separados, mas integrados dentro do mesmo projeto.

---

## 🌐 Projeto online

### 👉 https://lospit-barbeshop.vercel.app/

<div align="center">

<a href="https://lospit-barbeshop.vercel.app/">
  <img src="./front-end/public/assets/los-pit/hero/hero-team-720.webp" alt="Los Pit Barber Shop Preview" width="100%"/>
</a>

<sub>👆 Clique na imagem para acessar o site.</sub>

</div>

---

## 🚀 Funcionalidades

### 👤 Clientes

* Cadastro e autenticação de usuários.
* Login seguro.
* Visualização dos serviços disponíveis.
* Visualização dos profissionais.
* Consulta de horários disponíveis.
* Seleção de profissional.
* Seleção de um ou mais serviços.
* Escolha de data e horário.
* Realização de agendamentos.
* Informações de preço e duração.
* Integração com WhatsApp.
* Experiência totalmente responsiva.

### 💈 Profissionais

* Cadastro de profissionais.
* Especialidades.
* Foto e biografia.
* Serviços vinculados a cada profissional.
* Horários personalizados de atendimento.
* Intervalos configuráveis.
* Bloqueio de períodos específicos.
* Controle de disponibilidade.

### 📅 Agendamentos

O sistema possui estrutura para controlar diferentes estados:

* `PENDING`
* `CONFIRMED`
* `COMPLETED`
* `CANCELLED`
* `NO_SHOW`

Cada agendamento pode armazenar:

* Cliente.
* Profissional.
* Serviços.
* Data.
* Horário inicial e final.
* Valor.
* Telefone.
* E-mail.
* Observações.
* Timezone.
* Status.

### 🔐 Segurança

* Autenticação utilizando **JWT**.
* Access Token.
* Refresh Token.
* Hash de senhas com **Argon2**.
* Validação de dados utilizando **Zod**.
* Proteção HTTP com **Helmet**.
* Rate limiting.
* Controle de CORS.
* Tokens de recuperação de senha.
* Logs de auditoria.

### 🖼️ Conteúdo

* Galeria da barbearia.
* Serviços configuráveis.
* Profissionais configuráveis.
* Imagens otimizadas.
* Configurações gerais da empresa.

---

# 🛠️ Tecnologias

## Front-end

| Tecnologia       | Utilização                          |
| ---------------- | ----------------------------------- |
| React 19         | Construção da interface             |
| TypeScript       | Tipagem estática                    |
| Vite 7           | Ambiente de desenvolvimento e build |
| React Router     | Navegação                           |
| date-fns         | Manipulação de datas                |
| Lucide React     | Ícones                              |
| Inter            | Tipografia                          |
| Playfair Display | Tipografia                          |
| Vitest           | Testes                              |
| Playwright       | Testes E2E                          |
| ESLint           | Qualidade de código                 |

---

## Back-end

| Tecnologia         | Utilização             |
| ------------------ | ---------------------- |
| Node.js 22         | Runtime                |
| Express 5          | API REST               |
| TypeScript         | Desenvolvimento tipado |
| Prisma ORM         | Comunicação com banco  |
| PostgreSQL         | Banco de dados         |
| JWT                | Autenticação           |
| Argon2             | Hash de senhas         |
| Zod                | Validação              |
| Helmet             | Segurança HTTP         |
| CORS               | Controle de acesso     |
| express-rate-limit | Proteção da API        |
| Vitest             | Testes                 |

---

# 🏗️ Arquitetura

```text
Los-Pit-Barbeshop-site/
│
├── front-end/
│   ├── public/
│   │   └── assets/
│   │       └── los-pit/
│   │           ├── gallery/
│   │           ├── hero/
│   │           ├── logo/
│   │           ├── professionals/
│   │           └── service-icons/
│   │
│   ├── src/
│   ├── e2e/
│   ├── package.json
│   └── vite.config.ts
│
├── back-end/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   └── package.json
│
├── tools/
│
├── package.json
├── package-lock.json
└── README.md
```

---

# 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** através do **Prisma ORM**.

Entre as principais entidades estão:

```text
User
Professional
Service
ProfessionalService
ProfessionalSchedule
ProfessionalBreak
BlockedPeriod
Appointment
AppointmentService
RefreshToken
PasswordResetToken
GalleryImage
BusinessSetting
AuditLog
```

### Perfis de usuário

```text
CLIENT
PROFESSIONAL
ADMIN
```

---

# ⚙️ Como executar o projeto

## Pré-requisitos

Antes de começar, tenha instalado:

* Node.js **22.x**
* npm
* PostgreSQL
* Git

---

## 1. Clone o projeto

```bash
git clone https://github.com/Harlen539/Los-Pit-Barbeshop-site.git
```

Entre na pasta:

```bash
cd Los-Pit-Barbeshop-site
```

---

## 2. Instale as dependências

```bash
npm install
```

O projeto utiliza **npm workspaces**, então as dependências do front-end e back-end serão instaladas automaticamente.

---

# 🔑 Variáveis de ambiente

## Front-end

Copie:

```bash
front-end/.env.example
```

para:

```bash
front-end/.env
```

Configuração padrão:

```env
VITE_API_URL=/api
VITE_PUBLIC_SITE_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=55XXXXXXXXXXX
```

---

## Back-end

Copie:

```bash
back-end/.env.example
```

para:

```bash
back-end/.env
```

Exemplo:

```env
NODE_ENV=development

PORT=3333

FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/los_pit?schema=public

DIRECT_URL=postgresql://postgres:postgres@localhost:5432/los_pit?schema=public

JWT_ACCESS_SECRET=troque-por-uma-chave-com-no-minimo-32-caracteres

JWT_REFRESH_SECRET=troque-por-outra-chave-com-no-minimo-32-caracteres

APP_TIMEZONE=America/Fortaleza

WHATSAPP_NUMBER=55XXXXXXXXXXX

ADMIN_EMAIL=

ADMIN_PASSWORD=
```

> ⚠️ Nunca publique arquivos `.env` contendo credenciais reais.

---

# 🗃️ Configurando o banco

Execute as migrations:

```bash
npm run db:migrate -w back-end
```

Popule o banco com os dados iniciais:

```bash
npm run db:seed -w back-end
```

---

# ▶️ Executando

Para iniciar front-end e back-end simultaneamente:

```bash
npm run dev
```

O projeto utiliza `concurrently` para iniciar os dois ambientes.

### Front-end

```text
http://localhost:5173
```

### API

```text
http://localhost:3333
```

---

# 📜 Scripts

## Desenvolvimento

```bash
npm run dev
```

Executa **front-end + back-end**.

---

## Build

```bash
npm run build
```

Gera o build completo da plataforma.

---

## Lint

```bash
npm run lint
```

Executa o ESLint no projeto.

---

## TypeScript

```bash
npm run typecheck
```

Verifica erros de tipagem.

---

## Testes

```bash
npm test
```

Executa os testes do front-end e back-end.

---

## Testes E2E

```bash
npm run test:e2e -w front-end
```

Executados com **Playwright**.

---

## Prisma Migration

```bash
npm run db:migrate -w back-end
```

---

## Prisma Deploy

```bash
npm run db:deploy -w back-end
```

---

## Seed

```bash
npm run db:seed -w back-end
```

---

## Otimização de assets

```bash
npm run assets
```

---

# 📱 Responsividade

O projeto foi desenvolvido pensando em diferentes dispositivos:

* 🖥️ Desktop
* 💻 Notebook
* 📱 Smartphone
* 📲 Tablets

A interface mantém a identidade visual da **Los Pit** tanto no desktop quanto no mobile.

---

# 🎨 Identidade visual

A experiência visual foi construída seguindo a identidade da **Los Pit Barber Shop**, buscando transmitir:

* Presença.
* Irmandade.
* Cultura urbana.
* Exclusividade.
* Modernidade.
* Estilo.
* Personalidade.

Com predominância de tons escuros e uma interface minimalista, o design mantém o foco nos profissionais, serviços e na experiência de agendamento.

---

# 🔒 API

A API possui estrutura preparada para operações relacionadas a:

```text
Autenticação
Usuários
Profissionais
Serviços
Horários
Disponibilidade
Agendamentos
Galeria
Configurações
Auditoria
```

A camada de segurança utiliza:

```text
JWT
Argon2
Helmet
Rate Limit
CORS
Zod
```

---

# ☁️ Deploy

A aplicação web está publicada utilizando **Vercel**.

### Produção

👉 **[lospit-barbeshop.vercel.app](https://lospit-barbeshop.vercel.app/)**

Para deploy em produção, configure corretamente as variáveis de ambiente do front-end e da API.

---

# 🧪 Qualidade

O projeto conta com ferramentas para manter a qualidade da aplicação:

* ESLint
* TypeScript
* Vitest
* Playwright
* Validação de schema com Zod
* Prisma
* Testes automatizados
* Type checking

---

# 📄 Licença

Este projeto está distribuído sob a licença **MIT**.

Consulte:

[`LICENSE`](./LICENSE)

para mais informações.

---

<div align="center">

<a href="https://lospit-barbeshop.vercel.app/">
  <img src="./front-end/public/assets/los-pit/logo/logo-los-pit.png" width="110" alt="Los Pit"/>
</a>

### LOS PIT BARBER SHOP

**Presença. Estilo. Irmandade.**

<br>

Desenvolvido por
[**Harlen**](https://github.com/Harlen539)

<br>

[🌐 Acessar site](https://lospit-barbeshop.vercel.app/) •
[💻 Repositório](https://github.com/Harlen539/Los-Pit-Barbeshop-site)

</div>
