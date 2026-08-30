#!/usr/bin/env bash
# scripts/restore-db.sh
# Restores a compressed SQL backup into the PostgreSQL database.
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <path-to-backup.sql.gz>"
  echo "Example: $0 ./backups/sapar_db_20260825_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' not found!"
  exit 1
fi

read -rp "WARNING: This will overwrite the existing database. Continue? (y/N): " CONFIRM
if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
  echo "Restore aborted."
  exit 0
fi

echo "==> Restoring from ${BACKUP_FILE}..."

gunzip -c "${BACKUP_FILE}" | docker compose --env-file docker/.env -f docker/docker-compose.yml exec -T postgres \
  psql -U "${POSTGRES_USER:-sapar}" -d "${POSTGRES_DB:-sapar_production}"

echo "==> Database restore complete!"
