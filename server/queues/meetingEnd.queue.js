const Queue = require("bull");
const redis = require("../utils/redisClient");

const meetingEndQueue = new Queue("meeting-end", {
  redis,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
  },
});

module.exports = meetingEndQueue;
