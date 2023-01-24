import * as pg from "pg";
const { Pool } = pg.default;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: `postgres://xzughoey:${process.env.POSTGRESQL_SECRET}@arjuna.db.elephantsql.com/xzughoey`,
});

export { pool };
