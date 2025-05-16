#!/bin/sh

echo "Waiting for database to be ready..."

# Extrair host e porta do DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Aguardar até que o banco de dados esteja disponível
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is ready!"

# Gerar o Prisma Client
echo "Generating Prisma Client..."
yarn prisma generate

echo "Starting application..."
exec "$@"