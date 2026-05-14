FROM node:20-alpine AS builder

# Instalar dependencias de compilación para sqlite3 y otras dependencias
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

COPY package*.json ./
COPY scripts/ ./scripts/

RUN npm ci

COPY src ./src
COPY server.js ./

# Etapa final
FROM node:20-alpine

# Instalar MySQL client y otras dependencias necesarias
RUN apk add --no-cache mysql-client curl bash

# Crear usuario no root para seguridad
RUN addgroup -S nodeapp && \
    adduser -S -G nodeapp nodeapp

WORKDIR /app

# Copiar del builder con permisos correctos
COPY --from=builder --chown=nodeapp:nodeapp /app/package*.json ./
COPY --from=builder --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodeapp /app/src ./src
COPY --from=builder --chown=nodeapp:nodeapp /app/server.js ./

# Copiar archivo .env si existe
COPY --chown=nodeapp:nodeapp .env* ./

# Crear directorio uploads y asignar permisos
RUN mkdir -p /app/uploads && \
    chown -R nodeapp:nodeapp /app/uploads && \
    chmod 755 /app/uploads

# Copiar y configurar script de entrada
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Copiar y configurar healthcheck
COPY healthcheck.sh /app/
RUN chmod +x /app/healthcheck.sh

# Configurar healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD ["/app/healthcheck.sh"]

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no root
USER nodeapp

# Punto de entrada
ENTRYPOINT ["/app/docker-entrypoint.sh"]
