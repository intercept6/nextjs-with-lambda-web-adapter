import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/_database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'1
  dbCredentials: {
    ssl: false,
    host: "postgres",
    database: "postgres",
    user: "postgres",
    password: "postgres",
  },
});
