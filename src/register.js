const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const router = express.Router();

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
      else resolve(this);
    });
  });
}

router.post("/registro", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      password.length <= 8 ||
      password.length >= 10
    ) {
      return res.status(400).json({ error: "Credenciales Invalidas" });
    }

    const existing = await dbGet("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await dbRun(
      "INSERT INTO usuarios (email, password) VALUES (?, ?)",
      [email, passwordHash]
    );

    return res.status(201).json({ message: "Usuario Registrado" });
  } catch (err) {
    console.error("Error /registro:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;