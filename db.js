// db.js
import Database from 'better-sqlite3';

const db = new Database('canvas.sqlite');
db.pragma('foreign_keys = ON');

export default db;