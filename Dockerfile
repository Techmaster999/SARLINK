FROM node:22-alpine

# 1. Enable pnpm inside the container
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the package files explicitly from your local client folder
COPY client/package.json client/pnpm-lock.yaml* ./

# 4. Install dependencies
RUN pnpm install --ignore-scripts

# 5. Copy the rest of the application code from the client folder
COPY client/ .

EXPOSE 8888

# 6. Run the dev script with verification disabled
CMD ["pnpm", "run", "dev"]
