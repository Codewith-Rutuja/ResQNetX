const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in environment variables");
  process.exit(1);
}

/* ===========================
   MongoDB Connection
=========================== */
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ===========================
   Schema Definition
=========================== */
const reportSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },

    district: { type: String, default: "Unknown", trim: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    severity: { type: Number, required: true, min: 1, max: 5 },

    category: { type: String, default: "CITIZEN REPORT" },

    disaster_type: { type: String, default: "OTHER" },

    assigned: { type: Boolean, default: false },

    time: { type: Date, default: Date.now },

    rps: { type: Number, required: true, min: 0, max: 100 },

    tier: {
      type: String,
      required: true,
      enum: ["critical", "high", "medium", "low"],
    },

    sos: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* Geo Index for optimization */
reportSchema.index({ location: "2dsphere" });

const Report = mongoose.model("Report", reportSchema);

/* ===========================
   Middleware
=========================== */
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ===========================
   Health Check
=========================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ===========================
   Get All Reports
=========================== */
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ rps: -1, createdAt: -1 })
      .lean();

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/* ===========================
   Create Report
=========================== */
app.post("/api/reports", async (req, res) => {
  try {
    const {
      text,
      district,
      lat,
      lng,
      severity,
      rps,
      tier,
      disaster_type,
      sos,
    } = req.body;

    if (!text || lat === undefined || lng === undefined || !severity || !rps || !tier) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const report = await Report.create({
      text,
      district,
      severity,
      rps,
      tier,
      disaster_type,
      sos,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: "Invalid report payload" });
  }
});

/* ===========================
   Assign Report
=========================== */
app.patch("/api/reports/:id/assign", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { assigned: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    res.status(400).json({ error: "Invalid report ID" });
  }
});

/* ===========================
   Filter Reports
=========================== */
app.get("/api/reports/filter", async (req, res) => {
  try {
    const { tier, district, disaster_type } = req.query;

    const filter = {};
    if (tier) filter.tier = tier;
    if (district) filter.district = district;
    if (disaster_type) filter.disaster_type = disaster_type;

    const reports = await Report.find(filter)
      .sort({ rps: -1 })
      .lean();

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Filtering failed" });
  }
});

/* ===========================
   Analytics Dashboard
=========================== */
app.get("/api/analytics", async (req, res) => {
  try {
    const tierSummary = await Report.aggregate([
      {
        $group: {
          _id: "$tier",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReports = await Report.countDocuments();

    res.json({
      totalReports,
      tierSummary,
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

/* ===========================
   Catch All Route
=========================== */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ===========================
   Start Server
=========================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:3000`);
});