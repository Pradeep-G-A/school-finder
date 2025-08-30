import mysql from 'mysql2/promise';

// This function will be used by our API routes to connect to the database.
export async function query({ query, values = [] }) {
  // Read the credentials from the environment variables.
  const dbconnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        // Required for secure connection to TiDB Cloud
        rejectUnauthorized: true
    }
  });

  try {
    const [results] = await dbconnection.execute(query, values);
    dbconnection.end();
    return results;
  } catch (error) {
    // Log any errors to the console for debugging
    console.error("Database query failed: ", error.message);
    throw Error(error.message);
  }
}

