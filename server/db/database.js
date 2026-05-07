const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let _db;

function getDb() {
    if (_db) return _db;

    const dbPath = process.env.DB_PATH || path.join(__dirname, 'farm.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    return _db;
}

module.exports = { getDb };
