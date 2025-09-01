const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", 
            // required: true 
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reason: {
            type: String,
            required: true,
            enum: [
                "Misleading Information",
                "Scam / Fraud",
                "Offensive Content",
                "Duplicate Listing",
                "Other",
                "Account Blocked",
            ],
        },
        description: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved"],
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
