# LanaLend API (Microloans) — Proyecto DevSecOps

API REST para el proyecto **LanaLend (Microloans)**.  
Incluye **registro seguro**, **login con JWT**, **endpoint central protegido** (solicitud de préstamo) y **logs** en archivo conforme al Parcial 3.

---

## Requisitos
- **Node.js** (recomendado: v18+)
- **sqlite3** (comando disponible en terminal)
- Postman o Thunder Client (opcional, para pruebas)

---

## Instalación 
```bash
git clone
cd lanalend-api
npm install
sqlite3 db/lanalend.db < db/init.sql
npm start


