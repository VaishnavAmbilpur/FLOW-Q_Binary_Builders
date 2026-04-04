const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const OrganizationSchema = new mongoose.Schema({}, { strict: false });
const ApiKeySchema = new mongoose.Schema({}, { strict: false });

const Organization = mongoose.model('Organization', OrganizationSchema);
const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        const keys = await ApiKey.find({});
        console.log(`Found ${keys.length} API Keys`);

        for (const key of keys) {
            const org = await Organization.findById(key.organizationId);
            console.log(`Key ID: ${key._id}`);
            console.log(`  Key Prefix: ${key.prefix}`);
            console.log(`  Organization ID: ${key.organizationId}`);
            console.log(`  Organization Found: ${org ? org.name : "❌ NOT FOUND"}`);
        }

        const orgs = await Organization.find({});
        console.log(`\nAvailable Organizations (${orgs.length}):`);
        orgs.forEach(o => console.log(`  - ${o.name} (${o._id})`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}
check();
