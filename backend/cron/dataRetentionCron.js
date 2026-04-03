const cron = require('node-cron');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const logger = require('../utils/logger');

const initDataRetentionCron = () => {
    // Run every night at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        logger.info('Starting Data Retention Cron Job...');
        try {
            const hospitals = await Hospital.find({});
            for (const hospital of hospitals) {
                const { queueLogsDays = 30, appointmentsDays = 90 } = hospital.dataRetention || {};

                const queueCutoff = new Date();
                queueCutoff.setDate(queueCutoff.getDate() - queueLogsDays);

                const apptCutoff = new Date();
                apptCutoff.setDate(apptCutoff.getDate() - appointmentsDays);

                // Queue Deletion
                const deletedQueues = await Patient.deleteMany({
                    hospitalId: hospital._id,
                    createdAt: { $lt: queueCutoff }
                });

                // Appointments Deletion
                const deletedAppts = await Appointment.deleteMany({
                    hospitalId: hospital._id,
                    createdAt: { $lt: apptCutoff }
                });

                if (deletedQueues.deletedCount > 0 || deletedAppts.deletedCount > 0) {
                    logger.info(`Data Retention Cleanup for hospital ${hospital.name}: 
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
