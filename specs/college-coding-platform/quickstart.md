# Developer Quickstart & Local Setup Guide

**Project**: College Coding Platform  
**Target Environment**: Node.js 20+, PostgreSQL 15+, Redis 7+

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`
- **PostgreSQL**: Local instance or Docker container (`postgres:15-alpine`)
- **Redis**: Local instance or Docker container (`redis:7-alpine`)

---

## 2. Environment Configuration (`.env.local`)

```env
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/college_coding_db?schema=public"

# Redis & Background Queue (BullMQ)
REDIS_URL="redis://localhost:6379"

# Authentication (Auth.js / NextAuth v5)
AUTH_SECRET="your-32-character-random-secret-key-here"
AUTH_TRUST_HOST="true"

# Email Provider (Resend / SMTP for Magic Links & Verification)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-email-provider-api-key"
EMAIL_FROM="noreply@college-coding.edu"

# Platform Seed (Initial Super Admin)
INITIAL_SUPER_ADMIN_EMAIL="admin@college-coding.edu"
```

---

## 3. Local Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations
npx prisma migrate dev --name init

# 3. Seed initial branches, demo achievements, and super admin
npx prisma db seed

# 4. Start the background sync worker daemon (in separate terminal)
npm run worker:dev

# 5. Start the Next.js development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 4. Running Validation & Test Suites

```bash
# Run unit tests (ranking formula, achievement condition parser, DTO sanitization)
npm run test:unit

# Run integration tests (Prisma queries, sync pipeline, provider fallback)
npm run test:integration

# Run Playwright End-to-End user journey tests
npm run test:e2e
```
