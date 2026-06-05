const axios = require("axios");

const WA_CONFIG = {
    user: "BharatScrap_BW",
    pass: "123456",
    sender: "BUZWAP",
    baseUrl: "http://waapi.hoverbusinessservices.com/api/sendmsgutil.php",
};

async function sendOtp(phone, otp) {
    console.log(`Sending OTP ${otp} to phone ${phone}`);
    try {
        const params = new URLSearchParams({
            user: WA_CONFIG.user,
            pass: WA_CONFIG.pass,
            sender: WA_CONFIG.sender,
            phone: String(phone),
            text: "otp",
            priority: "wa",
            stype: "auth",
            Params: String(otp),
        });

        const response = await axios.get(`${WA_CONFIG.baseUrl}?${params.toString()}`);

        console.log("WhatsApp OTP sent:", response.data);
        return { success: true, message: "OTP sent successfully" };
    } catch (err) {
        console.error("WhatsApp OTP error:", err.message);
        return { success: false, message: "Failed to send OTP" };
    }
}

async function sendMessage(phone, text) {
    try {
        const params = new URLSearchParams({
            user: WA_CONFIG.user,
            pass: WA_CONFIG.pass,
            sender: WA_CONFIG.sender,
            phone: String(phone),
            text: text,
            priority: "wa",
            stype: "normal",
        });

        const response = await axios.get(`${WA_CONFIG.baseUrl}?${params.toString()}`);

        console.log("WhatsApp message sent:", response.data);
        return { success: true, message: "Message sent successfully" };
    } catch (err) {
        console.error("WhatsApp message error:", err.message);
        return { success: false, message: "Failed to send message" };
    }
}

module.exports = { sendOtp, sendMessage };