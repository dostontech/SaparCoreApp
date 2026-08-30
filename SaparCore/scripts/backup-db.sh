#!/usr/bin/env bash
# scripts/backup-db.sh
# Creates an immediate, timestamped compressed PostgreSQL backup.
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sapar_db_${TIMESTAMP}.sql.gz"

echo "==> Creating PostgreSQL backup to ${BACKUP_FILE}..."

docker compose --env-file docker/.env -f docker/docker-compose.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-sapar}" "${POSTGRES_DB:-sapar_production}" | gzip > "${BACKUP_FILE}"

echo "==> Backup complete! File: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
