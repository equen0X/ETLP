require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const path = require("path");
const db = require("./config/db");

/* Route Imports */
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const optionRoutes = require("./routes/optionRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const videoRoutes = require("./routes/videoRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const driveRoutes = require("./routes/driveRoutes");
const driveSaRoutes = require("./routes/driveSaRoutes");
const debugRoutes = require("./routes/debugRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

/* =========================
   Middleware
========================= */

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   Database Connection
========================= */

db.query("SELECT 1")
  .then(() => {
    console.log("✅ MySQL Connected");
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed");
    console.error(err);
  });

/* =========================
   API Routes
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/enrollments", enrollmentRoutes);

app.use("/api/modules", moduleRoutes);

app.use("/api/quizzes", quizRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/options", optionRoutes);

app.use("/api/submissions", submissionRoutes);

app.use("/api/results", resultRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/certificates", certificateRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/videos", videoRoutes);

app.use("/api/ratings", ratingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/drive", driveRoutes);
app.use("/api/drive/sa", driveSaRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/uploads", uploadRoutes);

// Log registered routes (for debugging)
try {
  const entries = app._router && app._router.stack ? app._router.stack : [];
  const routes = entries.map((e) => {
    return {
      name: e.name,
      path: e.route ? e.route.path : (e.regexp ? e.regexp.toString() : null)
    };
  });
  console.log('Route stack snapshot:', JSON.stringify(routes, null, 2));
} catch (e) {
  console.error('Failed to list routes', e.message);
}

/* =========================
   Home Route
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    project: "Emerging Technologies Learning Portal",
    version: "1.0.0",
    status: "Running"
  });
});

/* =========================
   Test Route
========================= */

app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Working Successfully"
  });
});

/* =========================
   Health Check
========================= */

app.get("/health", async (req, res) => {

  try {

    await db.query("SELECT 1");

    res.status(200).json({
      success: true,
      server: "Running",
      database: "Connected",
      timestamp: new Date()
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      server: "Running",
      database: "Disconnected"
    });

  }

});

/* =========================
   Route Not Found
========================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });

});

/* =========================
   Global Error Handler
========================= */

app.use((err, req, res, next) => {

  console.error("Global Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });

});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 ETLP Server Running On Port ${PORT}`
  );

});