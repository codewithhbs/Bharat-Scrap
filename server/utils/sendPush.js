// Unified push sender
//  - Android: FCM token  -> firebase-admin
//  - iOS:     ExponentPushToken[...] -> Expo Push API (APNs, EAS credentials)
const axios = require("axios");
const admin = require("../config/firebase");

const isExpoToken = (t) => typeof t === "string" && /^Expo(nent)?PushToken\[.+\]$/.test(t);

// data values string hone chahiye (FCM rule) — Expo ke liye bhi same rakhte hain
const stringifyData = (data = {}) =>
  Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v == null ? "" : String(v)]));

async function sendExpo(tokens, { title, body, data }) {
  const messages = tokens.map((to) => ({
    to,
    title,
    body,
    data: stringifyData(data),
    sound: "default",
    priority: "high",
    channelId: "default",
  }));
  const results = [];
  for (let i = 0; i < messages.length; i += 100) {
    const { data: res } = await axios.post("https://exp.host/--/api/v2/push/send", messages.slice(i, i + 100), {
      timeout: 15000,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
    results.push(...(res?.data || []));
  }
  const failed = results.filter((r) => r.status !== "ok");
  if (failed.length) console.warn("[push] Expo errors:", JSON.stringify(failed));
  return results;
}

function fcmMessage({ title, body, data }) {
  return {
    notification: { title, body },
    data: stringifyData(data),
    android: {
      priority: "high",
      notification: { sound: "default", channelId: "default" },
    },
    apns: {
      payload: { aps: { sound: "default", contentAvailable: true } },
    },
  };
}

// Single token
async function sendPush(token, payload) {
  if (!token) throw new Error("Push token missing");
  if (isExpoToken(token)) {
    const [r] = await sendExpo([token], payload);
    if (r && r.status !== "ok") throw new Error(r.message || "Expo push failed");
    return r;
  }
  return admin.messaging().send({ token, ...fcmMessage(payload) });
}

// Multiple tokens (mixed Android/iOS ok)
async function sendPushMany(tokens = [], payload) {
  const list = [...new Set(tokens.filter(Boolean))];
  const expo = list.filter(isExpoToken);
  const fcm = list.filter((t) => !isExpoToken(t));
  const out = { expo: null, fcm: null };
  if (expo.length) out.expo = await sendExpo(expo, payload);
  if (fcm.length) out.fcm = await admin.messaging().sendEachForMulticast({ tokens: fcm, ...fcmMessage(payload) });
  return out;
}

module.exports = { sendPush, sendPushMany, isExpoToken };
