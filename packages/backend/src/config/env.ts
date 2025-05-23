import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env file if available
dotenv.config({
  path:
    process.env.DOTENV_CONFIG_PATH || path.resolve(process.cwd(), "sample.env"),
});

interface Environment {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATA_DIR: string;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  CORS_ORIGIN: string;
}

// Default values
const env: Environment = {
  NODE_ENV: (process.env.NODE_ENV as Environment["NODE_ENV"]) || "development",
  PORT: parseInt(process.env.PORT || "3001", 10),
  DATA_DIR: process.env.DATA_DIR || path.join(process.cwd(), "data"),
  LOG_LEVEL: (process.env.LOG_LEVEL as Environment["LOG_LEVEL"]) || "info",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

// Ensure the data directory exists
if (!fs.existsSync(env.DATA_DIR)) {
  fs.mkdirSync(env.DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${env.DATA_DIR}`);
}

export default env;
