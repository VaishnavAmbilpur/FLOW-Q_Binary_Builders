const mongoose = require('mongoose');
const QueueEntry = require('./models/QueueEntry');
const Organization = require('./models/Organization');

const MONGODB_URL = 'mongodb+srv://vaishnavambilpur2006:Vaishnav%4011@cluster0.nhu16gt.mongodb.net/DTC';

async function check() {
    await mongoose.connect(MONGODB_URL);
    const orgId = '69d00f9f7087653944f93aa8';
    const org = await Organization.findById(orgId);
    console.log('ORG:', org ? org.name : 'NOT FOUND');
    const entries = await QueueEntry.find({ organizationId: orgId });
    console.log('ENTRIES FOUND:', entries.length);
    console.log('STATUSES:', entries.map(e => e.status));
    process.exit();
}
check();
