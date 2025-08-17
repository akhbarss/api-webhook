FROM node:20-alpine AS builder

WORKDIR /app

# Copy deps dan install
COPY package*.json ./
RUN npm install

# Copy source code (termasuk prisma/schema.prisma)
COPY . .

# Generate Prisma Client setelah schema ada
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# ---- Runtime stage ----
FROM node:20-alpine

WORKDIR /app

# Copy hasil build & deps dari builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./ 
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
