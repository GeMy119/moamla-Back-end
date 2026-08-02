import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';

// Ensure the logs directory exists
const logDir = path.join(process.cwd(), 'logs'); // Ensure logs directory is created in the current working directory
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true }); // Create the directory if it doesn't exist
}

// Create Winston logger
const logger = createLogger({
  level: 'error', // Log only errors
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamps
    format.errors({ stack: true }), // Include error stack traces
    format.json() // Log in JSON format for structured logs
  ),
  transports: [
    new transports.File({
      filename: path.join(logDir, 'errors.log'),
      level: 'error',
    }), // Save error logs to a file
  ],
});

export default logger;
