# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      openssl \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


FROM base AS build

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN rm -rf src/generated/prisma \
    && DATABASE_URL=postgresql://docker:docker@localhost:5432/docker \
       npx prisma generate

RUN npm run build

# nest build компилирует TS, но не копирует нативный Prisma Query Engine.
# Поэтому переносим его рядом со скомпилированным Prisma Client.
RUN cp \
    src/generated/prisma/libquery_engine-*.so.node \
    dist/src/generated/prisma/


FROM base AS migrate

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

CMD ["npx", "prisma", "migrate", "deploy"]


FROM base AS runner

ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

USER node

CMD ["node", "dist/src/main.js"]