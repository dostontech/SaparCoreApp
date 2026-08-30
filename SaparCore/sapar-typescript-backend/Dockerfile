# syntax=docker/dockerfile:1.7

# 1. Build Stage: install all deps, generate Prisma client, and compile TypeScript to dist/
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* tsconfig*.json ./
COPY prisma ./prisma/
RUN npm install --no-audit --no-fund --loglevel=warn
COPY . .
RUN npx prisma generate
RUN mkdir -p /app/dist && (npx tsc -p tsconfig.build.json || true)

# 2. Lean Production Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund --loglevel=warn

# 3. Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Prisma 5.x runtime dependency
RUN apk add --no-cache openssl libc6-compat

# Non-root user
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --chown=app:app . .

# Generate Prisma client for runtime node_modules
RUN npx prisma generate

# uploads dir must exist and be writable by the app user (compose mounts a volume here).
RUN mkdir -p /app/uploads/products /app/uploads/company && chown -R app:app /app/uploads

# Entrypoint runs `prisma migrate deploy` (+ idempotent seed) before the server
RUN chmod +x /app/docker-entrypoint.sh

USER app

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/healthz || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
