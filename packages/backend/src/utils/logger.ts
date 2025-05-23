import env from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

// Check if running in test environment
const isTest = process.env.NODE_ENV === "test";

interface LogLevels {
  [key: string]: number;
}

const LOG_LEVELS: LogLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix ? `[${prefix}] ` : "";
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (LOG_LEVELS[level] >= LOG_LEVELS[env.LOG_LEVEL]) {
      const timestamp = new Date().toISOString();
      const formattedMessage = `${timestamp} ${level.toUpperCase()} ${
        this.prefix
      }${message}`;

      // Skip console output in test environment
      if (!isTest) {
        switch (level) {
          case "debug":
            console.debug(formattedMessage, ...args);
            break;
          case "info":
            console.info(formattedMessage, ...args);
            break;
          case "warn":
            console.warn(formattedMessage, ...args);
            break;
          case "error":
            console.error(formattedMessage, ...args);
            break;
        }
      }
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }
}

export const createLogger = (prefix?: string): Logger => {
  return new Logger(prefix);
};

export const logger = new Logger();

export default logger;
