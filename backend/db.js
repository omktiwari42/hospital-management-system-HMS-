require("dotenv").config();

const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const dbUrl = new URL(databaseUrl);

// Explicitly use the modern, secure SSL mode.
dbUrl.searchParams.set("sslmode", "verify-full");

const pool = new Pool({
  connectionString: dbUrl.toString(),
});

module.exports = pool;