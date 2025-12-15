// middleware/error.js
const fs = require("fs");
const path = require("path");

const errorLogPath = path.join(__dirname, "../logs/error.log");

function errorHandler(err, req, res, next) {
  const logBlock = `
[${new Date().toISOString()}]
${req.method} ${req.originalUrl}
Message: ${err.message}
Stack: ${err.stack}
----------------------------------------
`;

  // Debug to see if error handler is hit
  console.log("ERROR HANDLER MIDDLEWARE HIT:", err.message);

  fs.appendFile(errorLogPath, logBlock, (fsErr) => {
    if (fsErr) {
      console.error("❌ Failed to write to error.log:", fsErr);
    }
  });

  res.status(err.status || 500).json({
    message: "Internal Server Error",
  });
}

module.exports = errorHandler;
