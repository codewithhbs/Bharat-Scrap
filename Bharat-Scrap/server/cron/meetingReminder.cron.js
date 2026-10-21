// const meetingReminderQueue = require("../queues/meetingReminder.queue");
// const Meeting = require("../models/meeting.model");
// const sendEmail = require("../utils/SendEmail");
// const logMeetingAudit = require("../utils/logMeetingAudit");

// meetingReminderQueue.process(async (job) => {
//     const { meetingId, type } = job.data;

//     const meeting = await Meeting.findById(meetingId)
//         .populate("userId advocateId");

//     if (!meeting || meeting.status !== "scheduled") return;

//     const subject = `Meeting Reminder (${type.replace("_", " ")})`;

//     const message = `
//     <h3>${meeting.meetingTitle}</h3>
//     <p>Your meeting is scheduled at:</p>
//     <b>${meeting.startTime.toLocaleString()}</b>
//   `;

//     if (meeting.userId?.email) {
//         await sendEmail({ email: meeting.userId.email, subject, message });
//     }

//     if (meeting.advocateId?.email) {
//         await sendEmail({ email: meeting.advocateId.email, subject, message });
//     }

//     await logMeetingAudit({
//         meetingId,
//         action: "REMINDER_SENT",
//         meta: { type },
//     });
// });
