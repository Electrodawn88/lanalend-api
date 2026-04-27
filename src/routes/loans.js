const express = require("express");
const { dbRun } = require("../db");
const { requireAuth } = require("../middleware/auth");
const logger = require("../logger");

const router = express.Router();


function containsHtml(str) {
  return typeof str === "string" && /<[^>]+>/.test(str);
}


function safeSnippet(str, max = 30) {
  if (typeof str !== "string") return "(null)";
  const clean = str.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

router.post("/solicitud", requireAuth, async (req, res) => {
  try {
    const { amount, termMonths, purpose } = req.body ?? {};
    const userId = req.user?.userId;

    
    logger.debug(
      `Solicitud recibida: userId=${userId} amount=${amount} termMonths=${termMonths} purpose="${safeSnippet(
        purpose
      )}"`
    );

    
    if (
      !Number.isInteger(amount) || amount <= 0 ||
      !Number.isInteger(termMonths) || termMonths < 1 || termMonths > 24 ||
      typeof purpose !== "string" || purpose.length < 3 || purpose.length > 120 ||
      containsHtml(purpose)
    ) {
      
      logger.warn(`Solicitud inválida: userId=${userId}`);
      return res.status(400).json({ error: "Datos inválidos" });
    }

    
    const result = await dbRun(
      "INSERT INTO loans (user_id, amount, term_months, purpose) VALUES (?, ?, ?, ?)",
      [userId, amount, termMonths, purpose]
    );

    
    logger.info(`Solicitud creada: loanId=${result.lastID} userId=${userId} amount=${amount}`);

    return res.status(201).json({
      message: "Solicitud enviada",
      loanId: result.lastID,
      status: "SUBMITTED",
    });
  } catch (err) {
    
    logger.error(`Error en solicitud de préstamo: ${err.message}`);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;