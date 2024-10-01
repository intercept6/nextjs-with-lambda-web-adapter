import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./app/_database/schema.ts",
	out: "./drizzle",
	dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'
	driver: "aws-data-api",
	dbCredentials: {
		secretArn: process.env.SECRET_ARN!,
		resourceArn: process.env.RESOURCE_ARN!,
		database: process.env.DATABASE!,
	},
});
