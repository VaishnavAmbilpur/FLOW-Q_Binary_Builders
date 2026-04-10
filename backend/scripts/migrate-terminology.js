const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function migrate() {
    try {
        console.log("🚀 Starting Database Migration...");
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartqueue");
        const db = mongoose.connection.db;

        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log("Current collections:", collectionNames);

        // Rename Hospital -> Organization
        if (collectionNames.includes('hospitals')) {
            console.log("📦 Renaming 'hospitals' to 'organizations'...");
            await db.collection('hospitals').rename('organizations');
        }

        // Rename Patient -> Customer
        if (collectionNames.includes('patients')) {
            console.log("📦 Renaming 'patients' to 'customers'...");
            await db.collection('patients').rename('customers');
        }

        console.log("✅ Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
