const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const OrganizationSchema = new mongoose.Schema({ name: String }, { collection: 'organizations' });
const ApiKeySchema = new mongoose.Schema({
    prefix: String,
    hash: String,
    organizationId: mongoose.Schema.Types.ObjectId,
    isActive: { type: Boolean, default: true }
}, { collection: 'apikeys' });

const Organization = mongoose.model('Organization', OrganizationSchema);
const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function check() {
    let output = "";
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        output += "✅ Connected to MongoDB\n";

        const org = await Organization.findOne({});
        if (!org) {
            output += "❌ NO ORGANIZATIONS FOUND in database.\n";
        } else {
            output += `✅ Found Organization: ${org.name} (${org._id})\n`;

            const secret = crypto.randomBytes(32).toString('hex');
            const hash = await bcrypt.hash(secret, 10);
            const idBase64 = Buffer.from(org._id.toString()).toString('base64').replace(/=/g, '');

            const apiKeyDoc = new ApiKey({
                prefix: 'sq_test',
                hash: hash,
                organizationId: org._id,
                isActive: true
            });
            await apiKeyDoc.save();

            const fullKey = `sq_test_${idBase64}_${secret}`;
            output += `\n🚀 NEW VALID API KEY GENERATED:\n${fullKey}\n`;
        }

    } catch (e) {
        output += `❌ Error: ${e.message}\n`;
    } finally {
        fs.writeFileSync('db_fix_output.txt', output);
        await mongoose.connection.close();
        process.exit(0);
    }
}
check();
