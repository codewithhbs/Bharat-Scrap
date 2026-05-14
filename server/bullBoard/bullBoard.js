const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const meetingReminderQueue = require("../queues/meetingReminder.queue");
const meetingEndQueue = require("../queues/meetingEnd.queue");

const serverAdapter = new ExpressAdapter();

// UI route
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullAdapter(meetingReminderQueue),
    new BullAdapter(meetingEndQueue),
  ],
  serverAdapter,
});

module.exports = serverAdapter;
