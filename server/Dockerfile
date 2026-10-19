FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.11.2 --activate

FROM base AS deps
COPY package.json ./
RUN pnpm install --prod --ignore-scripts

FROM base AS runtime
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
EXPOSE 8888
CMD ["node", "src/index.js"]
