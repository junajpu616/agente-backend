# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Imágen final súper ligera)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Instalamos solo dependencias de producción para ahorrar memoria
RUN npm install --only=production
COPY --from=builder /app/dist ./dist

# Exponemos el puerto de la bóveda segura
EXPOSE 4000

# Comando de arranque
CMD ["node", "dist/main"]