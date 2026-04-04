const mongoose = require('mongoose');

async function dropIndex() {
    const MONGODB_URL = 'mongodb+srv://vaishnavambilpur2006:Vaishnav%4011@cluster0.nhu16gt.mongodb.net/DTC';
    try {
        await mongoose.connect(MONGODB_URL);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const collection = db.collection('apiusages');

        console.log('Dropping legacy index: hospitalId_1_yearMonth_1...');
        try {
            await collection.dropIndex('hospitalId_1_yearMonth_1');
            console.log('✅ Legacy index dropped successfully!');
        } catch (e) {
            if (e.code === 27) {
                console.log('ℹ️ Index already dropped.');
            } else {
                throw e;
            }
        }

        console.log('Dropping legacy index: organizationId_1_yearMonth_1 (to regenerate cleanly)...');
        try {
            await collection.dropIndex('organizationId_1_yearMonth_1');
            console.log('✅ Clean slate for organization index.');
        } catch (e) { }

        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

dropIndex();
