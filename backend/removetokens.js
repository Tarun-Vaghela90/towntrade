const mongoose = require("mongoose");
const User = require("./models/User"); // adjust path

const deleteTokens = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/towntrade", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear FCM tokens for all users
    const result = await User.updateMany(
      {},
      { $set: { fcmTokens: [] } }
    );

    console.log("All FCM tokens cleared for all users.");
    console.log("Matched users:", result.matchedCount);
    console.log("Modified users:", result.modifiedCount);

    // Disconnect after operation
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error clearing FCM tokens:", err);
  }
};

deleteTokens();
