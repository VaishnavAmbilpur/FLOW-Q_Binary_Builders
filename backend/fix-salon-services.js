const mongoose = require('mongoose');
const ApiKey = require('./models/ApiKey');
const Service = require('./models/Service');

const MONGO_URI = 'mongodb+srv://vaishnavambilpur2006:Vaishnav%4011@cluster0.nhu16gt.mongodb.net/DTC';

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const key = await ApiKey.findById('69cfbb8e7844582b6f949bfa');
    if (!key) { console.log('KEY NOT FOUND'); process.exit(1); }

    const orgId = key.organizationId;
    console.log('Org ID:', orgId);

    // Remove old sandbox services
    await Service.deleteMany({ organizationId: orgId });

    // Create barber-specific services
    const services = [
        { name: 'Haircut', category: 'styling', avgSessionDuration: 20 },
        { name: 'Beard Trim', category: 'grooming', avgSessionDuration: 10 },
        { name: 'Shave', category: 'grooming', avgSessionDuration: 15 },
        { name: 'Hair Color', category: 'styling', avgSessionDuration: 45 },
        { name: 'Head Massage', category: 'wellness', avgSessionDuration: 15 },
        { name: 'Haircut + Beard Combo', category: 'combo', avgSessionDuration: 30 },
    ];

    for (const s of services) {
        await Service.create({ organizationId: orgId, ...s, isActive: true });
    }

    const all = await Service.find({ organizationId: orgId });
    console.log('Created', all.length, 'services:');
    all.forEach(s => console.log('  -', s.name, '(' + s.avgSessionDuration + ' min)'));

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
