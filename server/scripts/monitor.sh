#!/bin/bash
# Health check — cron: */5 * * * * /var/www/shepherdai/server/scripts/monitor.sh

ENDPOINT="http://localhost:3000/api/health"
LOG="/var/www/shepherdai/server/logs/monitor.log"

mkdir -p "$(dirname $LOG)"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$ENDPOINT")

if [ "$RESPONSE" != "200" ]; then
    echo "[$(date)] Health check FAILED (HTTP $RESPONSE) — restarting" >> "$LOG"
    pm2 restart shepherdai
    # Add alerting here: curl -X POST $SLACK_WEBHOOK -d '{"text":"ShepherdAI down!"}'
else
    echo "[$(date)] OK" >> "$LOG"
fi

# Disk usage check
DISK=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK" -gt 80 ]; then
    echo "[$(date)] WARNING: Disk at ${DISK}%" >> "$LOG"
fi
