const fs = require('fs');
const path = require('path');

// Path to error.log in the project root
const logFilePath = path.join(__dirname, "../logs/error.log");

function logErrorToFile(err, extraInfo = '') {
  const timestamp = new Date().toISOString();
  const log = `
[${timestamp}]
${extraInfo}
Message: ${err.message}
Stack: ${err.stack}
--------------------------------------------------
`;

  // Append log; file will be created if it doesn't exist
  fs.appendFile(logFilePath, log, (fsErr) => {
    if (fsErr) {
      console.error('Failed to write to error.log:', fsErr);
    }
  });
}

module.exports = { logErrorToFile };
