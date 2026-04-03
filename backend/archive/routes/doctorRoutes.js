const router = require("express").Router();
const User = require("../models/User");
const { auth } = require("../middleware/authMiddleware");

// GET - Doctor info
router.get("/info", auth, async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.user.id, role: "DOCTOR" }).select("-password -refreshToken");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - Update availability + optional pause message
router.put("/availability", auth, async (req, res) => {
  try {
    const { availability, pauseMessage } = req.body;

    const updatePayload = { availability };
    // Clear the message when going back to Available; set it when pausing
    if (availability === "Not Available" && pauseMessage) {
      updatePayload.pauseMessage = pauseMessage.trim().slice(0, 200);
    } else {
      updatePayload.pauseMessage = "";
    }

    const doctor = await User.findOneAndUpdate(
      { _id: req.user.id, role: "DOCTOR" },
      updatePayload,
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (global.io) {
      global.io.to(req.user.id.toString()).emit("doctorAvailabilityChanged", {
        availability: doctor.availability,
        pauseMessage: doctor.pauseMessage
      });
      global.io.to(`doctor_public_${req.user.id.toString()}`).emit("doctorAvailabilityChanged", {
        availability: doctor.availability,
        pauseMessage: doctor.pauseMessage
      });
      if (doctor.hospitalId) {
        global.io.to(`hospital_public_${doctor.hospitalId.toString()}`).emit("doctorAvailabilityChanged", {
          availability: doctor.availability,
          pauseMessage: doctor.pauseMessage
        });
      }

      global.io.to(req.user.id.toString()).emit("queueUpdated");
      global.io.to(`doctor_public_${req.user.id.toString()}`).emit("queueUpdated");
      if (doctor.hospitalId) {
        global.io.to(`hospital_public_${doctor.hospitalId.toString()}`).emit("queueUpdated");
      }
    }

    res.json(doctor);
  } catch (err) {
    console.error("Availability Update Error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - Update average consultation time
router.put("/update-avg-time", auth, async (req, res) => {
  try {
    const { avgTime } = req.body;

    if (!avgTime || avgTime <= 0)
      return res.status(400).json({ message: "Invalid time" });

    const doctor = await User.findOneAndUpdate(
      { _id: req.user.id, role: "DOCTOR" },
      { avgConsultationTime: avgTime },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (global.io) {
      global.io.to(req.user.id.toString()).emit("queueUpdated");
      global.io.to(`doctor_public_${req.user.id.toString()}`).emit("queueUpdated");
      if (doctor.hospitalId) {
        global.io.to(`hospital_public_${doctor.hospitalId.toString()}`).emit("queueUpdated");
      }
    }

    res.json({ message: "Updated Successfully", doctor });
  } catch (err) {
    console.error("Update avg time error", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT - Assign myself to a receptionist
router.put("/receptionists/assign", auth, async (req, res) => {
    try {
        const { receptionistId } = req.body;
        if (req.user.role !== "DOCTOR") {
            return res.status(403).json({ message: "Only doctors can assign receptionists" });
        }

        const receptionist = await User.findOne({
            _id: receptionistId,
            hospitalId: req.user.hospitalId,
            role: "RECEPTIONIST"
        });

        if (!receptionist) {
            return res.status(404).json({ message: "Receptionist not found in your hospital" });
        }

        // Add doctor ID to assignedDoctors if not already there
        const doctorId = req.user.id.toString();
        if (!receptionist.assignedDoctors.map(id => id.toString()).includes(doctorId)) {
            receptionist.assignedDoctors.push(req.user.id);
            await receptionist.save();
        }

        res.json({
            message: "Receptionist assigned successfully",
            receptionist: {
                id: receptionist._id,
                name: receptionist.name,
                assignedDoctors: receptionist.assignedDoctors
            }
        });
    } catch (err) {
        console.error("Assign Receptionist Error", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET - List all receptionists in hospital
router.get("/receptionists", auth, async (req, res) => {
    try {
        if (req.user.role !== "DOCTOR") {
            return res.status(403).json({ message: "Doctors only" });
        }

        const receptionists = await User.find({
            hospitalId: req.user.hospitalId,
            role: "RECEPTIONIST"
        }).select("name email assignedDoctors");

        res.json(receptionists);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
