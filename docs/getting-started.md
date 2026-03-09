---
title: Getting Started
description: How to set up and run VivIPractice locally
---

# Getting Started

## Prerequisites
- Node.js 20+
- npm 11+ (comes with Node.js)
- Docker & Docker Compose

## Setup
1. Clone the repository and navigate to `vivipractice/`
2. Copy `.env.example` to `.env` and configure values
3. Start infrastructure: `docker compose -f docker/docker-compose.yml up -d`
4. Install dependencies: `npm install`
5. Generate Prisma client: `npm run db:generate`
6. Push schema to DB: `npm run db:push`
7. Seed default data: `npm run seed`

## Development
Run all apps simultaneously:
```
npm run dev
```

Individual apps:
- API: `npm run dev --workspace=@vivipractice/api` → http://localhost:3001
- Dashboard: `npm run dev --workspace=@vivipractice/dashboard` → http://localhost:3002
- Public Site: `npm run dev --workspace=@vivipractice/public-site` → http://localhost:3003
- Control Hub: `npm run dev --workspace=@vivipractice/control-hub` → http://localhost:3004

## API Documentation
Swagger UI is available at http://localhost:3001/api/docs in development mode.
