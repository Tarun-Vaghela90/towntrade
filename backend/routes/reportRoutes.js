const express = require("express");
const router = express.Router();
const { fetch_user } = require("../middlewares/AuthMiddleware");
const { restrictTo } = require("../middlewares/RestrictTo");
const reportController = require("../controllers/reportController");
const Report = require('../models/Report')
// Middleware to require logged-in user
router.use(fetch_user);

// Create a report
router.post("/", reportController.createReport);

// Get all reports (admin only)
router.get("/", restrictTo("admin"), reportController.getReports);
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if report exists
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Delete the report
    await Report.findByIdAndDelete(id);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ message: "Server error while deleting report" });
  }
});
// Update report status (admin only)
router.put("/:reportId/status", restrictTo("admin"), reportController.updateReportStatus);

module.exports = router;
