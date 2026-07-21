const { Client } = require('pg');

async function run() {
    const dbName = process.env.DATABASE_NAME;
    if (!dbName) throw new Error("DATABASE_NAME is missing");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is missing");

    const pgUrl = dbUrl.split('?')[0].replace(dbName, 'postgres');
    const setupClient = new Client({ connectionString: pgUrl });
    await setupClient.connect();
    await setupClient.query(`CREATE DATABASE "${dbName}" WITH TEMPLATE template0 ENCODING 'UTF8'`);
    await setupClient.end();
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
