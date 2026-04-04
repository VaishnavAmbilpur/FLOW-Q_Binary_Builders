const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v2';
let API_KEY = '';
let ORG_NAME = '';

async function runTests() {
    console.log("🚀 Starting B2B Protocol Stress Test...");
    console.log("-----------------------------------------");

    try {
        // 1. Provision Sandbox
        console.log("📦 1. Provisioning Sandbox Organization...");
        const provisionRes = await axios.post(`${BASE_URL}/demo/provision`);
        if (provisionRes.data.success) {
            API_KEY = provisionRes.data.apiKey;
            ORG_NAME = provisionRes.data.organizationName;
            console.log(` ✅ SUCCESS: Provisioned "${ORG_NAME}"`);
            console.log(`    API KEY: ${API_KEY.slice(0, 15)}...`);
        }

        const client = axios.create({
            baseURL: BASE_URL,
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
        });

        // 2. GET /info
        console.log("\n🔑 2. Testing Auth Link (GET /info)...");
        const infoRes = await client.get('/info');
        console.log(` ✅ SUCCESS: Organization Authenticated as "${infoRes.data.data.name}"`);

        // 3. GET /services
        console.log("\n🔍 3. Testing Discovery (GET /services)...");
        const servicesRes = await client.get('/services');
        const services = servicesRes.data.data;
        console.log(` ✅ SUCCESS: Fetched ${services.length} active service(s)`);
        const targetService = services[0];
        console.log(`    Target: ${targetService.name} (${targetService._id})`);

        // 4. GET /services/:id/slots
        console.log("\n📅 4. Testing Availability (GET /slots)...");
        const today = new Date().toISOString().split('T')[0];
        const slotsRes = await client.get(`/services/${targetService._id}/slots`, { params: { date: today } });
        console.log(` ✅ SUCCESS: Found ${slotsRes.data.data.slots.length} slots for ${today}`);
        const targetSlot = slotsRes.data.data.slots.find(s => s.status === 'available');

        // 5. POST /appointments/book
        console.log("\n📝 5. Testing Reservation (POST /appointments/book)...");
        const bookData = {
            serviceId: targetService._id,
            clientName: "Test Patient B2B",
            clientPhone: "1234567890",
            scheduledAt: `${today}T${targetSlot.time}:00Z`,
            notes: "Automated Protocol Test Suite"
        };
        const bookRes = await client.post('/appointments/book', bookData);
        const apptId = bookRes.data.data.appointmentId;
        console.log(` ✅ SUCCESS: Appointment Created (ID: ${apptId})`);

        // 6. PATCH /appointments/:id/arrive
        console.log("\n🏥 6. Testing Activation (PATCH /arrive)...");
        const arriveRes = await client.patch(`/appointments/${apptId}/arrive`);
        const { uniqueLinkId, tokenNumber } = arriveRes.data;
        console.log(` ✅ SUCCESS: Patient Arrived! Token #${tokenNumber}, Link: ${uniqueLinkId}`);

        // 7. GET /queue
        console.log("\n📊 7. Testing Live Board (GET /queue)...");
        const queueRes = await client.get('/queue');
        const entry = queueRes.data.data.find(e => e.uniqueLinkId === uniqueLinkId);
        if (entry) {
            console.log(` ✅ SUCCESS: Entry found in Live Board with status: ${entry.status}`);
        } else {
            throw new Error("Patient not found in live queue after arrival");
        }

        // 8. PATCH /queue/:id/action (Call)
        console.log("\n📢 8. Testing Merchant Action: CALL (PATCH /action)...");
        const callRes = await client.patch(`/queue/${uniqueLinkId}/action`, { action: 'call' });
        console.log(` ✅ SUCCESS: Status updated to: ${callRes.data.status}`);

        // 9. GET /queue/:id (Patient Board)
        console.log("\n📱 9. Testing Patient Board (GET /queue/:id)...");
        const statusRes = await client.get(`/queue/${uniqueLinkId}`);
        console.log(` ✅ SUCCESS: Patient seeing status as "${statusRes.data.data.status}"`);

        // 10. PATCH /queue/:id/action (Complete)
        console.log("\n🏁 10. Testing Merchant Action: COMPLETE (PATCH /action)...");
        const compRes = await client.patch(`/queue/${uniqueLinkId}/action`, { action: 'complete' });
        console.log(` ✅ SUCCESS: Status updated to: ${compRes.data.status}`);

        // 11. GET /queue/stats
        console.log("\n📈 11. Testing Analytics (GET /queue/stats)...");
        const statsRes = await client.get('/queue/stats');
        console.log(` ✅ SUCCESS: Totals - Waiting: ${statsRes.data.totals.waiting}, Completed Today: ${statsRes.data.totals.completed}`);

        console.log("\n-----------------------------------------");
        console.log("✨ ALL B2B PROTOCOL TESTS PASSED! ✨");
        console.log("-----------------------------------------");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST FAILED!");
        if (err.response) {
            console.error(`   Endpoint: ${err.config.method.toUpperCase()} ${err.config.url}`);
            console.error(`   Status Code: ${err.response.status}`);
            console.error(`   Error Payload:`, err.response.data);
        } else {
            console.error(`   Error Message: ${err.message}`);
        }
        process.exit(1);
    }
}

runTests();
