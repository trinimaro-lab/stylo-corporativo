const { Pool } = require("pg");
const { attachDatabasePool } = require("@vercel/functions");

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    attachDatabasePool(pool);
  }
  return pool;
}

function isAuthorized(req) {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN;
  return !!expected && !!token && token === expected;
}

module.exports = { getPool, isAuthorized };
