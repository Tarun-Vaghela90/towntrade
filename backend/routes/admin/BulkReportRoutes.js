// routes/report.js
const express = require("express");
const router = express.Router();
const Report = require("../../models/Report");

// exmaple req.body 
// {
//   "ids": ["64f8a3b12b6a1234abcd5678"],
//   "status": "resolved"
// }



// Bulk mark reports as resolved
router.put("/bulk-update", async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) {
      return res.status(400).json({ message: "Invalid request" });
    }
    await Report.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    res.json({ message: "Reports updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk delete reports
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    await Report.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Reports deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
