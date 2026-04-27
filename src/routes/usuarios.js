const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dbGet, dbRun } = require("../db");

const router = express.Router();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/registro", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    // Validaciones (seguras y claras)
    if (!isValidEmail(email) || typeof password !== "string" || password.length < 9) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Duplicados (parametrizado)
    const exists = await dbGet("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists) return res.status(409).json({ error: "El usuario ya existe" });

    // Hash
    const password_hash = await bcrypt.hash(password, 12);

    // Insert parametrizado
    await dbRun(
      "INSERT INTO usuarios (email, password_hash) VALUES (?, ?)",
      [email, password_hash]
    );

    return res.status(201).json({ message: "Usuario registrado" });
  } catch (err) {
    console.error("Error registro:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Buscar usuario (parametrizado)
    const user = await dbGet(
      "SELECT id, email, password_hash, role FROM usuarios WHERE email = ?",
      [email]
    );

    // Mensaje genérico (evita enumeración)
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    // JWT payload SIN datos sensibles (solo identificadores)
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret_change_me", {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;