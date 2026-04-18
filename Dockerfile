# Build and run the NestJS API (PostgreSQL is expected separately or via docker-compose).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY scripts ./scripts
COPY swagger ./swagger
COPY src ./src
# prisma.config.ts requires DATABASE_URL at load time; generate does not connect — placeholder only for this RUN.
RUN DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/_image_build?schema=public" npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/swagger ./swagger
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=nestjs:nodejs /app/package.json ./
COPY --from=build --chown=nestjs:nodejs /app/scripts/run-prod.cjs ./scripts/run-prod.cjs
USER nestjs
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node scripts/run-prod.cjs"]
