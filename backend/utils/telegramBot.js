const TelegramBot = require('node-telegram-bot-api');
const logger = require('./logger');

let botInstance = null;

function initTelegramBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        logger.info("Telegram Bot Token not found. Polling disabled.");
        return null;
    }

    try {
        // Create a bot that uses 'polling' to fetch new updates
        const bot = new TelegramBot(token, { polling: true });

        // Matches "/start"
        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            const firstName = msg.chat.first_name || "there";

            const welcomeMessage = `👋 Welcome to <b>FLOW-Q</b>, ${firstName}!\n\nYour unique Chat ID is: <code>${chatId}</code>\n\nPlease provide this exact ID to the Receptionist when booking your appointment to receive live realtime queue updates here.`;

            bot.sendMessage(chatId, welcomeMessage, { parse_mode: "HTML" });
            logger.info(`[TELEGRAM] Sent welcome message to new user ${firstName} (${chatId})`);
        });

        // Log unexpected polling errors
        bot.on('polling_error', (error) => {
            logger.error(`[TELEGRAM POLLING ERROR] ${error.code}: ${error.message}`);
        });

        logger.info("[TELEGRAM] Bot polling started successfully.");
        botInstance = bot;
        return bot;
    } catch (err) {
        logger.error("[TELEGRAM] Failed to initialize bot polling:", err.message);
        return null;
    }
}

module.exports = {
    initTelegramBot,
    getBot: () => botInstance
};
