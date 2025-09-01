// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../../models/User");



// example req.body 
//  {
//   "ids": ["64f8a3b12b6a1234abcd5678", "64f8a3b12b6a1234abcd5679"]
// }

// Bulk update account status (active/blocked)
router.put("/bulk-update", async (req, res) => {
  try {
    const { ids, accountStatus } = req.body;
    if (!ids || !Array.isArray(ids) || !accountStatus) {
      return res.status(400).json({ message: "Invalid request" });
    }
    await User.updateMany(
      { _id: { $in: ids } },
      { $set: { accountStatus } }
    );
    res.json({ message: "Users updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk delete users
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    await User.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Users deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
