const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Patient = require("../models/Patient");
const { v4: uuidv4 } = require("uuid");
const { sendQueueConfirmation } = require("../utils/notificationService");
const { emitSocketEvent } = require("../utils/socketUtils");

router.get("/:hospitalId/doctors", async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const doctors = await User.find({ hospitalId, role: "DOCTOR", availability: "Available" }).select('name specialization avgConsultationTime');

        const doctorsWithQueues = await Promise.all(doctors.map(async (doc) => {
            const queueCount = await Patient.countDocuments({
                doctorId: doc._id,
                status: "waiting",
            });
            return {
                _id: doc._id,
                name: doc.name,
                specialization: doc.specialization,
                avgConsultationTime: doc.avgConsultationTime,
                currentQueueLength: queueCount,
                estimatedWaitMins: queueCount * doc.avgConsultationTime
            };
        }));

        res.json({ success: true, data: doctorsWithQueues });
    } catch (err) {
        console.error("Kiosk Doctor fetch error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Kiosk: Create a new queue entry (Self check-in)
router.post("/:hospitalId/enqueue", async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { doctorId, name, phone, description } = req.body;

        if (!doctorId || !name) {
            return res.status(400).json({ message: "Doctor and Name are required" });
        }

        // Get today's start and end for token number calculation
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Calculate token number
        const count = await Patient.countDocuments({
            doctorId,
            status: "waiting"
        });

        const tokenNumber = count + 1;
        const uniqueLinkId = uuidv4();
        const doctor = await User.findById(doctorId);

        // Fetch hospital to fallback to default branch if doctor lacks one
        const Hospital = require('../models/Hospital');
        const hospital = await Hospital.findById(hospitalId);

        // Resolve branch ID
        let branchId = doctor?.branchId;
        if (!branchId && hospital) {
            if (hospital.branches && hospital.branches.length > 0) {
                branchId = hospital.branches[0]._id;
            } else {
                // Auto-create default branch for legacy hospitals
                hospital.branches = [{ name: "Main Branch", address: "Legacy Auto-Created" }];
                await hospital.save();
                branchId = hospital.branches[0]._id;
            }
        }

        if (!branchId) {
            return res.status(400).json({ message: "No branch found for this hospital" });
        }

        // Create Patient
        const patient = new Patient({
            hospitalId,
            branchId,
            doctorId,
            name,
            number: phone || "",
            description: description || "Self check-in via Kiosk",
            tokenNumber,
            uniqueLinkId,
            status: "waiting",
            createdAt: new Date()
        });

        await patient.save();

        emitSocketEvent(doctorId.toString(), "queueUpdated", undefined, hospitalId.toString());

        const trackingUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/status/${uniqueLinkId}`
            : `http://localhost:3000/status/${uniqueLinkId}`;
        if (phone) {
            sendQueueConfirmation(phone, name, tokenNumber, trackingUrl, doctor?.name || "Doctor");
        }

        res.status(201).json({
            success: true,
            message: "Added to queue successfully",
            tokenNumber,
            uniqueLinkId,
            statusLink: `/api/queue/status/${uniqueLinkId}`
        });
    } catch (err) {
        console.error("Kiosk enqueue error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Display Board: Fetch the currently serving token for every available doctor in the hospital
router.get("/:hospitalId/display", async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const doctors = await User.find({ hospitalId, role: "DOCTOR", availability: { $in: ["Available", "Not Available"] } }).select('name specialization');

        // Get today's start and end bounds
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const displayData = await Promise.all(doctors.map(async (doc) => {
            const upcomingPatients = await Patient.find({
                doctorId: doc._id,
                status: "waiting",
            }).select('tokenNumber name').sort({ tokenNumber: 1 }).limit(4);

            const currentlyServing = upcomingPatients.length > 0 ? upcomingPatients[0] : null;
            const nextTokens = upcomingPatients.slice(1).map(p => p.tokenNumber);

            return {
                doctorId: doc._id,
                doctorName: doc.name,
                specialization: doc.specialization,
                servingToken: currentlyServing ? currentlyServing.tokenNumber : "---",
                nextTokens: nextTokens
            };
        }));

        res.json({ success: true, data: displayData });
    } catch (err) {
        console.error("Display fetch error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Display Board (Doctor Specific): Fetch the currently serving token for a specific doctor
router.get("/:hospitalId/display/:doctorId", async (req, res) => {
    try {
        const { hospitalId, doctorId } = req.params;
        const doc = await User.findOne({ _id: doctorId, hospitalId, role: "DOCTOR" }).select('name specialization');

        if (!doc) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Get today's start and end bounds
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const upcomingPatients = await Patient.find({
            doctorId: doc._id,
            status: "waiting",
        }).select('tokenNumber name').sort({ tokenNumber: 1 }).limit(10); // get more next tokens for a dedicated screen

        const currentlyServing = upcomingPatients.length > 0 ? upcomingPatients[0] : null;
        const nextTokens = upcomingPatients.slice(1).map(p => p.tokenNumber);

        const displayData = {
            doctorId: doc._id,
            doctorName: doc.name,
            specialization: doc.specialization,
            servingToken: currentlyServing ? currentlyServing.tokenNumber : "---",
            nextTokens: nextTokens
        };

        res.json({ success: true, data: displayData });
    } catch (err) {
        console.error("Doctor Specific Display fetch error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
