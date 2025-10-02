import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Winston logger configuration
 * Logs to both console and file with proper formatting
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom colors
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

winston.addColors(customColors);

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
  })
);

// Custom format for file output without colors
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console output with colors
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    }),
    
    // File output - all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true
    }),
    
    // File output - errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true
    }),
    
    // File output - daily rotation for production
    new winston.transports.File({
      filename: path.join(logsDir, `test-${new Date().toISOString().split('T')[0]}.log`),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 30 // Keep 30 days
    })
  ],
  
  // Exit on error: false to continue tests even if logging fails
  exitOnError: false
});

// Add helper methods for better logging
export const logTestStart = (testName: string) => {
  logger.info('='.repeat(80));
  logger.info(`TEST STARTED: ${testName}`);
  logger.info('='.repeat(80));
};

export const logTestEnd = (testName: string, status: 'PASSED' | 'FAILED', duration?: number) => {
  logger.info('-'.repeat(80));
  if (duration) {
    logger.info(`TEST ${status}: ${testName} (${duration}ms)`);
  } else {
    logger.info(`TEST ${status}: ${testName}`);
  }
  logger.info('='.repeat(80));
};

export const logStep = (stepDescription: string) => {
  logger.info(`→ ${stepDescription}`);
};

export const logError = (error: Error | string, context?: string) => {
  if (context) {
    logger.error(`[${context}] ${error}`);
  } else {
    logger.error(error);
  }
};

// Log unhandled errors
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Log startup
logger.info('Logger initialized successfully');
logger.info(`Log level: ${process.env.LOG_LEVEL || 'info'}`);
logger.info(`Logs directory: ${logsDir}`);