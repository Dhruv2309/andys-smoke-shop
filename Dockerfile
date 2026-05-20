FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm install
COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/backend/package.json ./backend/package.json
COPY --from=base /app/node_modules ./node_modules
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/server.js"]
