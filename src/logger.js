const fs = require("fs");
const path = require("path");
const winston = require("winston");


const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });


const lineFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] | [${level.toUpperCase()}] | ${message}`;
});

const logger = winston.createLogger({
  level: "debug", 
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    lineFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "app.log"),
    }),
    
    new winston.transports.Console(),
  ],
});

module.exports = logger;