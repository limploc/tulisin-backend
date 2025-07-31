import { Pool, QueryResult, PoolConfig, QueryResultRow } from "pg";
import { AppError, ErrorCode } from "../types/errors";

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface DatabaseTransaction {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface DatabaseClient {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  release(): void;
}

class Database {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
    };

    this.pool = new Pool(poolConfig);
    this.setupPoolErrorHandlers();
  }

  private setupPoolErrorHandlers(): void {
    this.pool.on("error", (err: Error) => {
      console.error("Unexpected error on idle client", err);
      this.isConnected = false;
    });

    this.pool.on("connect", () => {
      console.log("New client connected to the database");
      this.isConnected = true;
    });

    this.pool.on("remove", () => {
      console.log("Client removed from pool");
    });
  }

  async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      this.isConnected = true;
      console.log("Database connection successful");
    } catch (error) {
      this.isConnected = false;
      throw new AppError("Failed to connect to database", 500, ErrorCode.INTERNAL_ERROR, {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    try {
      const result = await this.pool.query<T>(text, params);
      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, text, params);
    }
  }

  async getClient(): Promise<DatabaseClient> {
    try {
      const client = await this.pool.connect();

      return {
        query: async <T extends QueryResultRow = QueryResultRow>(
          text: string,
          params?: unknown[]
        ): Promise<QueryResult<T>> => {
          try {
            return await client.query<T>(text, params);
          } catch (error) {
            throw this.handleDatabaseError(error, text, params);
          }
        },
        release: () => {
          client.release();
        },
      };
    } catch (error) {
      throw new AppError("Failed to get database client", 500, ErrorCode.INTERNAL_ERROR, {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async beginTransaction(): Promise<DatabaseTransaction> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      return {
        query: async <T extends QueryResultRow = QueryResultRow>(
          text: string,
          params?: unknown[]
        ): Promise<QueryResult<T>> => {
          try {
            return await client.query<T>(text, params);
          } catch (error) {
            throw this.handleDatabaseError(error, text, params);
          }
        },
        commit: async (): Promise<void> => {
          try {
            await client.query("COMMIT");
            client.release();
          } catch (error) {
            client.release();
            throw this.handleDatabaseError(error, "COMMIT");
          }
        },
        rollback: async (): Promise<void> => {
          try {
            await client.query("ROLLBACK");
            client.release();
          } catch (error) {
            client.release();
            throw this.handleDatabaseError(error, "ROLLBACK");
          }
        },
      };
    } catch (error) {
      client.release();
      throw this.handleDatabaseError(error, "BEGIN");
    }
  }

  async executeTransaction<T>(callback: (transaction: DatabaseTransaction) => Promise<T>): Promise<T> {
    const transaction = await this.beginTransaction();

    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private handleDatabaseError(error: unknown, query?: string, params?: unknown[]): AppError {
    const dbError = error as { message?: string; code?: string; detail?: string; hint?: string; constraint?: string };

    console.error("Database error:", {
      error: dbError.message,
      query,
      params,
      code: dbError.code,
      detail: dbError.detail,
      hint: dbError.hint,
    });

    const errorMappings: { [key: string]: { statusCode: number; errorCode: string } } = {
      "23505": { statusCode: 409, errorCode: ErrorCode.CONFLICT },
      "23503": { statusCode: 400, errorCode: ErrorCode.BAD_REQUEST },
      "23502": { statusCode: 400, errorCode: ErrorCode.BAD_REQUEST },
      "23514": { statusCode: 400, errorCode: ErrorCode.BAD_REQUEST },
      "42P01": { statusCode: 500, errorCode: ErrorCode.INTERNAL_ERROR },
      "42703": { statusCode: 500, errorCode: ErrorCode.INTERNAL_ERROR },
      "08000": { statusCode: 500, errorCode: ErrorCode.INTERNAL_ERROR },
      "08003": { statusCode: 500, errorCode: ErrorCode.INTERNAL_ERROR },
      "08006": { statusCode: 500, errorCode: ErrorCode.INTERNAL_ERROR },
    };

    const mapping = dbError.code ? errorMappings[dbError.code] : undefined;

    if (mapping) {
      return new AppError(this.getReadableErrorMessage(dbError), mapping.statusCode, mapping.errorCode, {
        postgresCode: dbError.code,
        detail: dbError.detail,
        hint: dbError.hint,
        query,
        constraint: dbError.constraint,
      });
    }

    return new AppError("Database operation failed", 500, ErrorCode.INTERNAL_ERROR, {
      originalError: dbError.message,
      postgresCode: dbError.code,
      detail: dbError.detail,
      hint: dbError.hint,
      query,
    });
  }

  private getReadableErrorMessage(error: { code?: string; message?: string }): string {
    switch (error.code) {
      case "23505":
        return "A record with this information already exists";
      case "23503":
        return "Referenced record does not exist";
      case "23502":
        return "Required field is missing";
      case "23514":
        return "Data violates database constraints";
      case "42P01":
        return "Database table not found";
      case "42703":
        return "Database column not found";
      case "08000":
      case "08003":
      case "08006":
        return "Database connection error";
      default:
        return error.message || "Database operation failed";
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  getPoolInfo(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      console.log("Database connection pool closed");
    } catch (error) {
      console.error("Error closing database connection pool:", error);
      throw new AppError("Failed to close database connection", 500, ErrorCode.INTERNAL_ERROR, {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

let databaseInstance: Database | null = null;

export function initializeDatabase(config: DatabaseConfig): Database {
  if (databaseInstance) {
    throw new AppError("Database already initialized", 500, ErrorCode.INTERNAL_ERROR);
  }

  databaseInstance = new Database(config);
  return databaseInstance;
}

export function getDatabase(): Database {
  if (!databaseInstance) {
    throw new AppError("Database not initialized. Call initializeDatabase first.", 500, ErrorCode.INTERNAL_ERROR);
  }

  return databaseInstance;
}

export async function closeDatabase(): Promise<void> {
  if (databaseInstance) {
    await databaseInstance.close();
    databaseInstance = null;
  }
}

export default Database;
