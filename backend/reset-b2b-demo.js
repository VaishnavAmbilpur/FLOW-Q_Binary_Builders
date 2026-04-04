const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const Organization = require('./models/Organization');
const Service      = require('./models/Service');
const QueueEntry   = require('./models/QueueEntry');
const Appointment  = require('./models/Appointment');
const ApiKey       = require('./models/ApiKey');
const ApiUsage     = require('./models/ApiUsage');

dotenv.config();

async function resetB2BDemo() {
    console.log('----------------------------------------------------');
    console.log('🧹 B2B PROTOCOL RESET: Initiating Factory Wipe...');
    console.log('----------------------------------------------------');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to Clinical Registry.');

        // 1. Identify the 'Apex' or 'Demo' organizations
        const orgs = await Organization.find({ 
            $or: [
                { name: 'APEX MEDICAL GROUP' },
                { name: 'Apex Medical Group' },
                { name: 'B2B Demo Organization' }
            ] 
        });

        if (orgs.length === 0) {
            console.log('✨ No B2B Demo data detected. System is already clean.');
            process.exit(0);
        }

        const orgIds = orgs.map(o => o._id);
        console.log(`📡 Identified ${orgs.length} Demo Organization(s).`);

        // 2. Cascading Purge
        console.log('🔥 Purging associated entities...');
        
        const results = await Promise.all([
            QueueEntry.deleteMany({ organizationId: { $in: orgIds } }),
            Appointment.deleteMany({ organizationId: { $in: orgIds } }),
            Service.deleteMany({ organizationId: { $in: orgIds } }),
            ApiKey.deleteMany({ organizationId: { $in: orgIds } }),
            ApiUsage.deleteMany({ organizationId: { $in: orgIds } }),
            Organization.deleteMany({ _id: { $in: orgIds } })
        ]);

        console.log(`✅ Queue Entries Purged: ${results[0].deletedCount}`);
        console.log(`✅ Appointments Purged:  ${results[1].deletedCount}`);
        console.log(`✅ Services Purged:      ${results[2].deletedCount}`);
        console.log(`✅ API Keys Revoked:     ${results[3].deletedCount}`);
        console.log(`✅ Usage Metrics Wiped:  ${results[4].deletedCount}`);
        console.log(`🏆 Organizations Deleted: ${results[5].deletedCount}`);

        console.log('----------------------------------------------------');
        console.log('✨ B2B DEMO ECOSYSTEM CLEARED SUCCESSFULLY.');
        console.log('----------------------------------------------------');

    } catch (err) {
        console.error('❌ RESET FAILED:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetB2BDemo();
