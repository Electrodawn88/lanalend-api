const express = require("express");
const registerRouter = require("./register");

const app = express();
app.use(express.json());

app.use("/", registerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});