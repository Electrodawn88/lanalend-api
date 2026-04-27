const express = require("express");
const { dbRun } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Anti-HTML básico (para cumplir lo de “no etiquetas peligrosas”)
function containsHtml(str) {
  return typeof str === "string" && /<[^>]+>/.test(str);
}

router.post("/solicitud", requireAuth, async (req, res) => {
  try {
    const { amount, termMonths, purpose } = req.body ?? {};

    // Validación estricta:
    // - amount entero positivo
    // - termMonths entero en rango razonable
    // - purpose texto sin HTML y longitud controlada
    if (
      !Number.isInteger(amount) || amount <= 0 ||
      !Number.isInteger(termMonths) || termMonths < 1 || termMonths > 24 ||
      typeof purpose !== "string" || purpose.length < 3 || purpose.length > 120 ||
      containsHtml(purpose)
    ) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // Insert parametrizado (anti-SQLi)
    const result = await dbRun(
      "INSERT INTO loans (user_id, amount, term_months, purpose) VALUES (?, ?, ?, ?)",
      [req.user.userId, amount, termMonths, purpose]
    );

    return res.status(201).json({
      message: "Solicitud enviada",
      loanId: result.lastID,
      status: "SUBMITTED",
    });
  } catch (err) {
    console.error("Error solicitud préstamo:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;