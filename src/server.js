const express = require("express");
const usuarios = require("./routes/usuarios");
const loans = require("./routes/loans");

const app = express();
app.use(express.json());

app.use("/api/usuarios", usuarios);
app.use("/api/loans", loans);

app.get("/", (req, res) => res.json({ ok: true, name: "LanaLend API" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));