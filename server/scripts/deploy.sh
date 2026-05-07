#!/bin/bash
# Full server setup — run once on a fresh Ubuntu 22.04 box
# Usage: bash deploy.sh

set -e
echo "=== ShepherdAI Deployment Script ==="

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install -y nginx certbot python3-certbot-nginx nodejs npm sqlite3 git ufw fail2ban

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 5. Clone / pull repo (set your repo URL)
APP_DIR="/var/www/shepherdai"
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR" && git pull origin main
else
    sudo mkdir -p "$APP_DIR"
    sudo chown "$USER":"$USER" "$APP_DIR"
    git clone https://github.com/AgriSolveSA/Sheep.git "$APP_DIR"
fi

# 6. Install Node deps
cd "$APP_DIR/server" && npm install --production

# 7. Create .env from example if missing
if [ ! -f "$APP_DIR/server/.env" ]; then
    cp "$APP_DIR/server/.env.example" "$APP_DIR/server/.env"
    echo "⚠️  Edit $APP_DIR/server/.env with your real credentials before starting!"
fi

# 8. Init database
cd "$APP_DIR/server" && node db/init.js

# 9. Create required directories
mkdir -p "$APP_DIR/server/reports" "$APP_DIR/server/backups" "$APP_DIR/server/logs"

# 10. Start with PM2
pm2 start "$APP_DIR/server/server.js" --name shepherdai
pm2 save
pm2 startup

# 11. Cron jobs
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/server/scripts/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/server/scripts/monitor.sh") | crontab -

echo ""
echo "=== Done. Next steps ==="
echo "1. Edit /var/www/shepherdai/server/.env"
echo "2. Configure Nginx: sudo nano /etc/nginx/sites-available/shepherdai"
echo "3. Enable SSL: sudo certbot --nginx -d shepherdai.co.za"
echo "4. pm2 restart shepherdai"
