import dotenv from "dotenv";
import { DatabaseConfig } from "../database/database";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "tulisin_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    max: parseInt(process.env.DB_POOL_SIZE || "20"),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "2000"),
  };
};

export const getJwtConfig = () => {
  return {
    secret: process.env.JWT_SECRET || "fallback_secret_key_change_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  };
};

export const getSaltRounds = (): { saltRounds: number } => {
  return {
    saltRounds: parseInt(process.env.SALT_ROUNDS || "10"),
  };
};
