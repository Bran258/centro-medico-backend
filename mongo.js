import { MongoClient } from "mongodb";

let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const client = new MongoClient(process.env.MONGO_URI);
    cached.promise = client.connect().then((client) => ({
      client,
      db: client.db("clinica")
    }));
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

