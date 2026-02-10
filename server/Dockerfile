# Builder stage (needs build tools for native modules like better-sqlite3)
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy server package and install deps
COPY server/package.json server/package-lock.json* ./

RUN apt-get update && apt-get install -y python3 make g++ build-essential libsqlite3-dev && rm -rf /var/lib/apt/lists/*
# Use npm ci if lockfile exists, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy server sources, shared folder, and attached assets into image
COPY server/ ./
COPY shared/ ./shared/
COPY attached_assets/ ./attached_assets/

# Runtime stage
FROM node:20-bullseye-slim
WORKDIR /app

# Copy runtime deps, TS sources, shared code, and assets.
# We run via tsx to avoid ESM extension/path-alias issues in the plain tsc output.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/*.ts ./
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/attached_assets ./attached_assets

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "dev"]
