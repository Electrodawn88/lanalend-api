const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("db/lanalend.db", (err) => {
  if (err) console.error("Error conectando a SQLite:", err.message);
});

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // this.lastID
    });
  });
}

module.exports = { db, dbGet, dbRun };