# =========================
# 1) Builder
# =========================
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package files
COPY server/package.json server/package-lock.json* ./

# Install deps
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy sources
COPY server/ ./
COPY shared/ ./shared/
COPY attached_assets/ ./attached_assets/

# Build TS + rewrite aliases
RUN npm run build


# =========================
# 2) Runtime
# =========================
FROM node:20-bullseye-slim
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copy runtime artifacts only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/attached_assets ./attached_assets

# Run compiled JS (NO tsx)
CMD ["node", "dist/index.js"]
