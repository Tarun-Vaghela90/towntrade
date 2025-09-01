const User = require("../models/User");
const sendNotificationToUser = require("../service/notificationService");
const factory = require("./handlerFactory");
const { sendNotification } = require("./notificationController");





exports.getUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);


//  Admin privillage

exports.accountStatus = async (req, res) => {
  try {
    const { userId, updatedStatus, updatedRole } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update account status if provided
    if (updatedStatus) {
      if (!["active", "deactive", "blocked"].includes(updatedStatus)) {
        return res.status(400).json({ message: "Invalid account status" });
      }
      user.accountStatus = updatedStatus;
    }

    // Check account status before updating role
    if (updatedRole) {
      if (user.accountStatus !== "active") {
        return res.status(403).json({
          message: `Cannot change role. Account is ${user.accountStatus}.`
        });
      }

      if (!["user", "premium", "admin"].includes(updatedRole)) {
        return res.status(400).json({ message: "Invalid account role" });
      }

      user.role = updatedRole; // replace role instead of pushing
    }

    await user.save();

    res.status(200).json({
      message: "User account updated successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};







exports.UserAccountRole = async (req, res) => {
  try {
    // const updatedStatus = req.body?.updatedStatus;

    if (!req.user._id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // if (!updatedStatus) {
    //   return res.status(400).json({ message: "Updated status is required" });
    // }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate allowed statuses
    // if (updatedStatus !== "premium") {
    //   return res.status(400).json({ message: "Invalid account status" });
    // }

    user.role = "premium"
    await user.save();
    const title = "MemberShip Update"
    const message  = "Thank You For Became Our Premuim User" 
            await createNotification(req.user._id, title, message);
  
    res.status(200).json({
      message: "Account status updated successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



