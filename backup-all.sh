#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/febic/backups"
mkdir -p $BACKUP_DIR

echo "📦 Fazendo backup completo..."

# 1. Backup do banco
echo "💾 Banco de dados..."
docker exec febic-postgres pg_dump -U febic_user febic_db > "$BACKUP_DIR/db_${DATE}.sql"

# 2. Backup dos uploads
echo "📁 Arquivos de upload..."
tar -czf "$BACKUP_DIR/uploads_${DATE}.tar.gz" /var/www/febic/backend/uploads/ 2>/dev/null

# 3. Backup do volume PostgreSQL (completo)
echo "🗄️ Volume PostgreSQL..."
docker run --rm -v febic_postgres_data:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/postgres_volume_${DATE}.tar.gz -C /data .

# 4. Limpar backups antigos (manter 7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completo: $DATE"
ls -lh $BACKUP_DIR/ | tail -5
