const cron = require('node-cron');
const User = require('../models/User');
const logger = require('../utils/logger');

// Run every 15 minutes
const initScheduleCron = () => {
    logger.info("Initializing Agent Schedule Cron Job (Runs every 15m)");

    cron.schedule('*/15 * * * *', async () => {
        try {
            const agents = await User.find({ role: 'AGENT', "schedule.0": { $exists: true } });

            const now = new Date();
            const currentDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const currentDay = currentDayNames[now.getDay()];

            // Format current time as HH:MM
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMin = now.getMinutes().toString().padStart(2, '0');
            const currentTime = `${currentHour}:${currentMin}`;

            for (const agent of agents) {
                // Find today's schedule
                const todaySchedule = agent.schedule.find(s => s.day === currentDay);

                let shouldBeAvailable = false;

                if (todaySchedule && todaySchedule.startTime && todaySchedule.endTime) {
                    if (currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime) {
                        shouldBeAvailable = true;
                    }
                }

                const desiredStatus = shouldBeAvailable ? "Available" : "Not Available";

                if (agent.availability !== desiredStatus && agent.availability !== "On Break") {
                    agent.availability = desiredStatus;
                    await agent.save();
                    logger.info(`Cron: Updated Agent ${agent.name} availability to ${desiredStatus}`);
                }
            }
        } catch (err) {
            logger.error("Schedule Cron Job Error", { error: err.message });
        }
    });
};

module.exports = { initScheduleCron };
