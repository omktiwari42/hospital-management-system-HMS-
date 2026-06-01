const pool = require("./db");

async function testDB() {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    console.log(result.rows);
  } catch (error) {
    console.log(error);
  }
}

testDB();