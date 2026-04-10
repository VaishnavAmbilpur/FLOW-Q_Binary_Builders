const cron = require('node-cron');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');

const initDataRetentionCron = () => {
    // Run every night at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        logger.info('Starting Data Retention Cron Job...');
        try {
            const organizations = await Organization.find({});
            for (const organization of organizations) {
                const { queueLogsDays = 30, appointmentsDays = 90 } = organization.dataRetention || {};

                const queueCutoff = new Date();
                queueCutoff.setDate(queueCutoff.getDate() - queueLogsDays);

                const apptCutoff = new Date();
                apptCutoff.setDate(apptCutoff.getDate() - appointmentsDays);

                // Queue Deletion
                const deletedQueues = await Customer.deleteMany({
                    organizationId: organization._id,
                    createdAt: { $lt: queueCutoff }
                });

                // Appointments Deletion
                const deletedAppts = await Appointment.deleteMany({
                    organizationId: organization._id,
                    createdAt: { $lt: apptCutoff }
                });

                if (deletedQueues.deletedCount > 0 || deletedAppts.deletedCount > 0) {
                    logger.info(`Data Retention Cleanup for organization ${organization.name}: 
                        Deleted ${deletedQueues.deletedCount} old queue logs, 
                        Deleted ${deletedAppts.deletedCount} old appointments.`);
                }
            }
        } catch (error) {
            logger.error('Failed to execute Data Retention Cron Job:', error);
        }
        logger.info('Finished Data Retention Cron Job.');
    });
};

module.exports = { initDataRetentionCron };
