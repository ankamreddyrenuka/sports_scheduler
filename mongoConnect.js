const { MongoClient } = require("mongodb");

// ✅ Correct cluster URI (from your Atlas)
const uri = "mongodb+srv://yamunaankamreddy755_db_user:EK6SBISkJOKJP1xT@sportsscheduler.wlwz0wy.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    // ✅ Use your database and collection names
    const db = client.db("SportScheduler"); // your database name
    const collection = db.collection("users"); // your collection name

    // Sample query to verify connection
    const result = await collection.findOne();
    console.log("Sample document:", result);
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
  }
}

run();
