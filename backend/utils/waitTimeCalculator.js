/**
 * Calculates estimated waiting times for customers in queue
 * Based on:
 *  - queue position
 *  - agent's avg session time (minutes)
 *  - agent availability state
 */

function calculateWaitTimes(queue, agent) {
  const avgTime = agent?.avgSessionTime || 5; // default 5 mins
  const availability = agent?.availability || "Available";

  return queue.map((customer, index) => {
    // if agent unavailable - show unknown wait time
    if (availability === "Not Available") {
      return {
        ...(customer.toObject ? customer.toObject() : customer),
        waitMinutes: null,
        etaTime: null,
        message: "Agent is currently unavailable"
      };
    }

    const waitMinutes = index * avgTime;
    const eta = new Date(Date.now() + waitMinutes * 60000);

    return {
      ...(customer.toObject ? customer.toObject() : customer),
      waitMinutes,
      etaTime: eta,
      isTopThree: index < 3
    };
  });
}

module.exports = { calculateWaitTimes };
