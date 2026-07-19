const { Client } = require('pg');

async function run() {
    const dbName = process.env.DATABASE_NAME;
    if (!dbName) throw new Error("DATABASE_NAME is missing");

    const setupClient = new Client({ connectionString: "postgresql://postgres@127.0.0.1:55432/postgres" });
    await setupClient.connect();
    await setupClient.query(`CREATE DATABASE "${dbName}" WITH TEMPLATE template0 ENCODING 'UTF8'`);
    await setupClient.end();
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
