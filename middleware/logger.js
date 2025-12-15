// middleware/logger.js
const fs = require("fs");
const path = require("path");

const accessLogPath = path.join(__dirname, "../logs/access.log");

function logger(req, res, next) {
  const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`;

  // Debug to see if middleware is running at all
  console.log("LOGGER MIDDLEWARE HIT:", logLine.trim());

  fs.appendFile(accessLogPath, logLine, (err) => {
    if (err) {
      console.error("❌ Failed to write to access.log:", err);
    }
  });

  next();
}

module.exports = logger;
