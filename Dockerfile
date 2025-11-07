# Etapa de construcción
FROM node:16-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Etapa de producción
FROM node:16-alpine

# Instalar MySQL client y otras dependencias necesarias
RUN apk add --no-cache mysql-client curl bash

# Crear usuario no root para seguridad
RUN addgroup -S nodeapp && \
    adduser -S -G nodeapp nodeapp

# Directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios desde builder
COPY --from=builder --chown=nodeapp:nodeapp /app/package*.json ./
COPY --from=builder --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodeapp /app/src ./src
COPY --from=builder --chown=nodeapp:nodeapp /app/scripts ./scripts
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

# Exponer puerto (se tomará del .env)
EXPOSE ${PORT:-5000}

# Cambiar a usuario no root
USER nodeapp

# Punto de entrada
ENTRYPOINT ["/app/docker-entrypoint.sh"]
