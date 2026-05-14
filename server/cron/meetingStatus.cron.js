// const meetingEndQueue = require("../queues/meetingEnd.queue");
// const Meeting = require("../models/meeting.model");
// const logMeetingAudit = require("../utils/logMeetingAudit");

// meetingEndQueue.process(async (job) => {
//   const { meetingId } = job.data;

//   const meeting = await Meeting.findById(meetingId);
//   if (!meeting || meeting.isMeetingEnded) return;

//   meeting.isMeetingEnded = true;
//   meeting.status = "completed";
//   await meeting.save();

//   await logMeetingAudit({
//     meetingId,
//     action: "MEETING_ENDED",
//   });
// });
