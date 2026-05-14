const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bullBoardAdapter = require("./bullBoard/bullBoard");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
require("./cron/meetingReminder.cron");
require("./cron/meetingStatus.cron");

console.log("🚀 Bull workers running...");

const app = express();
const PORT = process.env.PORT || 4023;

// DB connect
connectDB();

// 🔥 CORS (header-based auth)
app.use(
  cors({
    origin: [
      "http://192.168.1.13:3000",
      "http://192.168.1.13:3001",
      "http://192.168.1.13:3007",
      "http://192.168.1.13:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Bull Board UI
app.use("/admin/queues", bullBoardAdapter.getRouter());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Docker + Node.js + Redis + Header Auth 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/car", require("./routes/carRoutes"));
app.use("/api/craneman", require("./routes/cranemanRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
