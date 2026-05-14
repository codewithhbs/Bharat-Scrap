const { google } = require("googleapis");
const readline = require("readline");

require("dotenv").config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // ⭐ MUST
  scope: SCOPES,
});

console.log("\nAuthorize this app by visiting this url:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nEnter the code from that page here: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);

    console.log("\nTOKENS RECEIVED:\n", tokens);
    console.log("\n✅ REFRESH TOKEN (SAVE THIS):\n", tokens.refresh_token);

    rl.close();
  } catch (err) {
    console.error("Error getting token:", err.message);
    rl.close();
  }
});
