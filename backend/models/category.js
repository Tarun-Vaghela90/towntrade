const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        unique: true
    },

    slug: {
        type: String,
        lowercase: true,
        trim: true
    },

    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },

    icon: {
        type: String,
        default: ""
    },

    // description: {
    //     type: String,
    //     trim: true
    // }

}, { timestamps: true });

categorySchema.index({ name: 1 });

module.exports = mongoose.model("Category", categorySchema);
