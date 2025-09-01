const Report = require("../models/Report");

// Create a new report
exports.createReport = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    const { product, reason, description } = req.body; // make sure product is here

    if (!reason) {
      return res.status(400).json({ error: "Product and reason are required" });
    }

    const report = await Report.create({
      reporter: req.user._id,  // fetch_user middleware provides req.user._id
      product,             // <-- required
      reason,
      status: "pending",
      description:description
    });

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create report" });
  }
};


// Get all reports (admin)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("product", "title")
      .populate("reporter", "fullName email");
    res.json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};
// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    // Validate status
    const allowedStatuses = ["pending", "reviewed", "resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    ).populate("product", "title").populate("reporter", "fullName email");

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ message: "Report status updated successfully", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update report status" });
  }
};
