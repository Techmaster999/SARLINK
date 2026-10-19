FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --ignore-scripts

COPY . .

EXPOSE 8888
CMD ["pnpm", "run", "dev"]
