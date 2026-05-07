const { getDb }= require('../db/database');
const fs       = require('fs');
const path     = require('path');

const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');

function runBackup() {
    fs.mkdirSync(backupDir, { recursive: true });

    const ts       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dest     = path.join(backupDir, `farm_${ts}.db`);
    const db       = getDb();

    db.backup(dest)
      .then(() => {
          console.log(`[backup] Saved to ${dest}`);
          _pruneOldBackups();
      })
      .catch(err => console.error('[backup] Failed:', err));
}

function _pruneOldBackups(keepDays = 30) {
    const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
    const files  = fs.readdirSync(backupDir).filter(f => f.startsWith('farm_') && f.endsWith('.db'));
    for (const f of files) {
        const full = path.join(backupDir, f);
        if (fs.statSync(full).mtimeMs < cutoff) {
            fs.unlinkSync(full);
            console.log(`[backup] Pruned old backup: ${f}`);
        }
    }
}

module.exports = { runBackup };
