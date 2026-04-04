/**
 * Calculates estimated waiting times for patients in queue
 * Based on:
 *  - queue position
 *  - doctor's avg consultation time (minutes)
 *  - doctor availability state
 */

function calculateWaitTimes(queue, doctor) {
  const avgTime = doctor?.avgConsultationTime || 8; // default 8 mins
  const availability = doctor?.availability || "Available";

  return queue.map((patient, index) => {
    // if doctor unavailable - show unknown wait time
    if (availability === "Not Available") {
      return {
        ...patient.toObject(),
        waitMinutes: null,
        etaTime: null,
        message: "Doctor is currently unavailable"
      };
    }

    // if doctor on break
    if (availability === "Break") {
      return {
        ...patient.toObject(),
        waitMinutes: null,
        etaTime: null,
        message: "Doctor is on break – please wait"
      };
    }

    // Normal calculation
    const waitMinutes = index * avgTime;
    const eta = new Date(Date.now() + waitMinutes * 60000);

    return {
      ...patient.toObject(),
      waitMinutes,
      etaTime: eta,
      isTopThree: index < 3   // Top‑3 alert flag
    };
  });
}

module.exports = { calculateWaitTimes };
