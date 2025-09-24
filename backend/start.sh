#!/bin/bash
set -e

echo "🔄 Aguardando banco de dados..."
wait-port postgres:5432

echo "📊 Executando migrations..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicação na porta 3002..."
npm start  