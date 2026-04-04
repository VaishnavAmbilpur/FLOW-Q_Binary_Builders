const axios = require("axios");

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Helper to ensure we only send to a 10-digit number (stripped of +91, 0, etc.)
 */
function sanitizeNumber(phone) {
    if (!phone) return "";
    // Remove all non-digits
    let digits = phone.replace(/\D/g, "");
    // If it starts with 91 and is 12 digits, strip the 91
    if (digits.length === 12 && digits.startsWith("91")) {
        digits = digits.slice(2);
    }
    // If it starts with 0 and is 11 digits, strip the 0
    if (digits.length === 11 && digits.startsWith("0")) {
        digits = digits.slice(1);
    }
    return digits;
}

/**
 * Helper to push messages to Telegram API
 */
async function sendTelegramMessage(chatId, text) {
    if (!TELEGRAM_BOT_TOKEN || !chatId) return false;
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: "HTML"
        });
        console.log(`[TELEGRAM SUCCESS] Alert sent to ${chatId}`);
        return true;
    } catch (err) {
        console.error(`[TELEGRAM ERROR] Failed to send alert to ${chatId}`, err.response?.data || err.message);
        return false;
    }
}

/**
 * Send Queue Confirmation via Fast2SMS (Quick SMS route)
 * @param {string} phone 
 * @param {string} name 
 * @param {number} position 
 * @param {string} trackingUrl 
 * @param {string} doctorName 
 */
async function sendQueueConfirmation(phone, name, position, trackingUrl, doctorName) {
    const cleanPhone = sanitizeNumber(phone);
    const message = `Hi ${name}, you are #${position} in Dr. ${doctorName}'s list. Track live: ${trackingUrl}`;
    const telegramMessage = `<b>Confirmation</b>\n\nHi <b>${name}</b>, you are <b>#${position}</b> in Dr. ${doctorName}'s list.\n\n🔗 Track live:\n${trackingUrl}`;

    if (TELEGRAM_BOT_TOKEN) {
        await sendTelegramMessage(phone, telegramMessage);
    }

    if (!FAST2SMS_API_KEY) {
        console.log(`[SIMULATED SMS] To ${phone} (${cleanPhone}): ${message}`);
        return true;
    }

    try {
        const payload = {
            route: 'q',
            message: message,
            language: 'english',
            numbers: cleanPhone,
            flash: 0
        };

        const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
            headers: {
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            }
        });
        console.log(`[FAST2SMS SUCCESS] Confirmation sent to ${cleanPhone}`, response.data);
        return true;
    } catch (err) {
        console.error(`[FAST2SMS ERROR] Failed to send Confirmation to ${phone}`, err.response?.data || err.message);
        return false;
    }
}

/**
 * Send "Nearly Up" Alert via Fast2SMS (Quick SMS)
 * @param {string} phone 
 * @param {string} name 
 * @param {string} doctorName 
 * @param {string} locationName 
 * @param {string} locationAddress 
 */
async function sendNearlyUpAlert(phone, name, doctorName, locationName = "", locationAddress = "") {
    const cleanPhone = sanitizeNumber(phone);
    const locText = locationName ? ` at ${locationName}` : " at the portal";
    const message = `Hi ${name}, you are nearly ready for your session with Dr. ${doctorName}${locText}. Please proceed in 5-10 mins.`;

    const telegramMessage = `⚠️ <b>Almost Ready!</b>\n\nHi <b>${name}</b>, you are next up to see Dr. <b>${doctorName}</b>.\n\n📍 <b>Location:</b> ${locationName || 'The Portal'}\nPlease arrive in the next 5-10 minutes.`;

    if (TELEGRAM_BOT_TOKEN) {
        await sendTelegramMessage(phone, telegramMessage);
    }

    if (!FAST2SMS_API_KEY) {
        console.log(`[SIMULATED SMS] To ${phone} (${cleanPhone}): ${message}`);
        return true;
    }

    try {
        const payload = {
            route: 'q',
            message: message,
            language: 'english',
            numbers: cleanPhone,
            flash: 0
        };

        const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
            headers: {
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            }
        });
        console.log(`[FAST2SMS SUCCESS] 'Ready' Alert sent to ${cleanPhone}`);
        return true;
    } catch (err) {
        console.error(`[FAST2SMS ERROR] Failed to send 'Ready' Alert to ${phone}`, err.message);
        return false;
    }
}

/**
 * Send Return Visit Reminder Notification
 */
async function sendReturnVisitReminder(phone, name, doctorName, date) {
    const cleanPhone = sanitizeNumber(phone);
    const formattedDate = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const message = `Hi ${name}, reminder for your upcoming session with Dr. ${doctorName} scheduled for tomorrow (${formattedDate}). See you then!`;
    const telegramMessage = `📅 <b>Session Reminder</b>\n\nHi <b>${name}</b>, this is to remind you about your session with Dr. <b>${doctorName}</b> tomorrow (<b>${formattedDate}</b>).`;

    if (TELEGRAM_BOT_TOKEN) {
        await sendTelegramMessage(phone, telegramMessage);
    }

    if (!FAST2SMS_API_KEY) {
        console.log(`[SIMULATED SMS] To ${phone} (${cleanPhone}): ${message}`);
        return true;
    }

    try {
        const payload = {
            route: 'q',
            message: message,
            language: 'english',
            numbers: cleanPhone,
            flash: 0
        };

        const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", payload, {
            headers: {
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            }
        });
        console.log(`[FAST2SMS SUCCESS] Reminder sent to ${cleanPhone}`);
        return true;
    } catch (err) {
        console.error(`[FAST2SMS ERROR] Failed to send Reminder to ${phone}`, err.message);
        return false;
    }
}

module.exports = {
    sendQueueConfirmation,
    sendNearlyUpAlert,
    sendReturnVisitReminder
};
