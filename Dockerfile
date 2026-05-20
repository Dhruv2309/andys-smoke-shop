FROM node:18-alpine AS build
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/schema.sql ./schema.sql
COPY --from=build /app/seed.sql ./seed.sql
EXPOSE 3000
CMD ["node", "dist/server.js"]
