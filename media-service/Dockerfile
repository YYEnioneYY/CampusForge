FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*
    

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci


FROM deps AS build

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

COPY prisma ./prisma
COPY src ./src

RUN DATABASE_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" \
    npx prisma generate

RUN npm run build


FROM build AS migrate

CMD ["npx", "prisma", "migrate", "deploy"]


FROM base AS prod-deps

COPY package.json package-lock.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force



FROM base AS runner

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist

COPY --from=build \
    /app/src/generated/prisma/libquery_engine-*.so.node \
    ./dist/src/generated/prisma/

COPY package.json ./

USER node

CMD ["node", "dist/src/main.js"]