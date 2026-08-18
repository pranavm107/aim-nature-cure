import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const adminDb = client.db().admin();
    const result = await adminDb.listDatabases();
    const exists = result.databases.some(db => db.name === 'aimnaturecure');
    console.log('Database aimnaturecure exists:', exists);
    const prescriptoExists = result.databases.some(db => db.name === 'prescripto');
    console.log('Database prescripto exists:', prescriptoExists);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
checkDb();
