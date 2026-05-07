#!/bin/bash
# Daily database backup — cron: 0 2 * * * /var/www/shepherdai/server/scripts/backup.sh

APP_DIR="/var/www/shepherdai/server"
BACKUP_DIR="$APP_DIR/backups"
DB_FILE="$APP_DIR/db/farm.db"
LOG="$APP_DIR/logs/backup.log"

mkdir -p "$BACKUP_DIR"

DEST="$BACKUP_DIR/farm_$(date +%Y%m%d_%H%M%S).db"
sqlite3 "$DB_FILE" ".backup '$DEST'"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup OK → $DEST" >> "$LOG"
else
    echo "[$(date)] Backup FAILED" >> "$LOG"
    exit 1
fi

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.db" -mtime +30 -delete

# Optional: rsync to USB
# rsync -av "$BACKUP_DIR/" /mnt/backup_drive/shepherdai/
