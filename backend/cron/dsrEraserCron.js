const cron = require('node-cron');
const crypto = require('crypto');
const DsrRequest = require('../models/DsrRequest');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const CommunicationConsent = require('../models/CommunicationConsent');
const logger = require('../utils/logger');

const initDsrEraserCron = () => {
    // Run every night at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        logger.info('Starting DSR Eraser Cron Job...');
        try {
            // Find all APPROVED deletion requests
            const pendingDeletes = await DsrRequest.find({
                requestType: "DELETE",
                status: "APPROVED"
            });

            for (const request of pendingDeletes) {
                const { patientPhone, organizationId } = request;

                // 1. Scrub Patient Queue Data
                // We overwrite name and number with hashed values so they can't be identified
                // but we keep the row for aggregate analytical reports (e.g., footfall count)
                const hashedPhone = crypto.createHash('sha256').update(patientPhone).digest('hex').substring(0, 16);

                await Patient.updateMany(
                    { number: patientPhone, hospitalId: organizationId },
                    {
                        $set: {
                            name: `[DELETED_${crypto.randomBytes(4).toString('hex')}]`,
                            number: hashedPhone,
                            notes: "[REDACTED]",
                            isAnonymous: true
                        }
                    }
                );

                // 2. Scrub Appointments
                await Appointment.updateMany(
                    { phone: patientPhone, hospitalId: organizationId },
                    {
                        $set: {
                            patientName: `[DELETED_${crypto.randomBytes(4).toString('hex')}]`,
                            phone: hashedPhone,
                            notes: "[REDACTED]"
                        }
                    }
                );

                // 3. Remove Communication Consent
                await CommunicationConsent.deleteMany({
                    phoneNumber: patientPhone,
                    organizationId: organizationId
                });

                // Mark DSR as completed
                request.status = "COMPLETED";
                request.completedAt = new Date();

                // Re-encrypt/anonymize the request log itself for extreme compliance
                request.patientPhone = hashedPhone;
                await request.save();

                logger.info(`DSR Erasure Completed for request ${request._id} at org ${organizationId}`);
            }

        } catch (error) {
            logger.error('Failed to execute DSR Eraser Cron Job:', error);
        }
        logger.info('Finished DSR Eraser Cron Job.');
    });
};

module.exports = { initDsrEraserCron };
