require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const apiKey = process.env.FAST2SMS_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.substring(0, 5) + "..." : "MISSING");

async function testSMS() {
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const payload = {
        route: 'q',
        message: 'Test Message from Flow-Q. Be Ready for your visit.',
        numbers: '9752317371', // I'll use a placeholder or ask the user
        language: 'english'
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                "authorization": apiKey,
                "Content-Type": "application/json"
            }
        });
        console.log("SUCCESS:", response.data);
    } catch (err) {
        console.error("ERROR:", err.response ? err.response.data : err.message);
    }
}

testSMS();
