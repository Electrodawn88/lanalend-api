const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dbGet, dbRun } = require("../db");
const logger = require("../logger");

const router = express.Router();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function maskToken(token) {
  if (!token || typeof token !== "string") return "(sin token)";
  return `${token.slice(0, 10)}...${token.slice(-6)}`;
}

router.post("/registro", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    
    logger.debug(`Registro recibido: email=${email ?? "(null)"}`);

    
    if (!isValidEmail(email) || typeof password !== "string" || password.length < 9) {
      
      logger.warn(`Registro inválido: email=${email ?? "(null)"}`);
      return res.status(400).json({ error: "Datos inválidos" });
    }

    
    const exists = await dbGet("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists) {
      logger.warn(`Registro duplicado: email=${email}`);
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    
    const password_hash = await bcrypt.hash(password, 12);

    
    await dbRun("INSERT INTO usuarios (email, password_hash) VALUES (?, ?)", [
      email,
      password_hash,
    ]);

    
    logger.info(`Registro exitoso: email=${email}`);

    return res.status(201).json({ message: "Usuario registrado" });
  } catch (err) {
    
    logger.error(`Error en registro: ${err.message}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    logger.debug(`Login recibido: email=${email ?? "(null)"}`);

    if (!isValidEmail(email) || typeof password !== "string") {
      logger.warn(`Login inválido (datos inválidos): email=${email ?? "(null)"}`);
      return res.status(400).json({ error: "Datos inválidos" });
    }

    
    const user = await dbGet(
      "SELECT id, email, password_hash, role FROM usuarios WHERE email = ?",
      [email]
    );

    
    if (!user) {
      logger.warn(`Login fallido (credenciales inválidas): email=${email}`);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      logger.warn(`Login fallido (credenciales inválidas): email=${email}`);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret_change_me", {
      expiresIn: "1h",
    });

    
    logger.info(
      `Login exitoso: userId=${user.id} role=${user.role} token=${maskToken(token)}`
    );

    return res.status(200).json({ token });
  } catch (err) {
    logger.error(`Error en login: ${err.message}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;