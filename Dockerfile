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

# Crear script de entrada
RUN printf '#!/bin/bash\n\
echo "🔄 Verificando conexión a MySQL..."\n\
until mysqladmin ping -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; do\n\
    echo "⏳ Esperando a MySQL..."\n\
    sleep 2\n\
done\n\
echo "✅ MySQL conectado exitosamente"\n\
\n\
echo "🔄 Ejecutando migraciones de la base de datos..."\n\
node scripts/setup-database.js\n\
\n\
echo "🚀 Iniciando BossBudget API..."\n\
exec npm start\n' > /app/entrypoint.sh && \
chmod +x /app/entrypoint.sh

# Crear script de inicio
RUN echo '#!/bin/sh\n\
echo "🔄 Verificando conexión a MySQL..."\n\
while ! mysqladmin ping -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" --silent; do\n\
    echo "⏳ Esperando a MySQL..."\n\
    sleep 2\n\
done\n\
echo "✅ MySQL conectado exitosamente"\n\
\n\
if [ "$RUN_MIGRATIONS" = "true" ]; then\n\
    echo "🔄 Ejecutando migraciones de la base de datos..."\n\
    node scripts/setup-database.js\n\
fi\n\
\n\
echo "🚀 Iniciando BossBudget API..."\n\
exec npm start\n\
' > /app/docker-entrypoint.sh

# Dar permisos de ejecución al script
RUN chmod +x /app/docker-entrypoint.sh

# Exponer puerto (se tomará del .env)
EXPOSE ${PORT:-5000}

# Cambiar a usuario no root
USER nodeapp

# Punto de entrada
ENTRYPOINT ["/app/docker-entrypoint.sh"]
