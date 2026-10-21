const Queue = require("bull");
const redis = require("../utils/redisClient")

const meetingReminderQueue = new Queue("meeting-reminder", {
  redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = meetingReminderQueue;
