import { initializeDatabase, closeDatabase } from "../src/database/database";
import { getDatabaseConfig } from "../src/config/config";

beforeAll(async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests can only be run in test environment. Set NODE_ENV=test");
  }

  const config = getDatabaseConfig();
  console.log(`Connecting to test database: ${config.database}`);

  const db = initializeDatabase(config);
  await db.testConnection();
});

afterEach(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

afterAll(async () => {
  try {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Skipping database cleanup - not in test environment");
      return;
    }

    const { getDatabase } = await import("../src/database/database");
    const db = getDatabase();

    await new Promise((resolve) => setTimeout(resolve, 100));

    await db.query("TRUNCATE TABLE notes, sections, users RESTART IDENTITY CASCADE");

    await closeDatabase();
  } catch (error) {
    console.error("Error during test cleanup:", error);
  }
});
