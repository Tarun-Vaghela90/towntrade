// Create one document
// factory.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const getCoordinatesFromAddress = require("../service/getCoordinatesFromAddress.js");
const sendNotificationToUser = require("../service/notificationService.js");
const sendNotificationToAllUsers = require("../utils/sendNotificationToAllUsers.js");
// const sendNotificationToUser = require("../service/notificationService.js");

// Factory function
exports.createOne = (Model) => async (req, res) => {
  const uploadedFiles = req.files || [];
  const title = `${Model.modelName} `;
  const message = `${Model.modelName} created successfully!`;
  try {
    if (Model.modelName === "Product") {
      console.log(req.body)
      // Check minimum 3 images
      if (uploadedFiles.length < 3) {
        uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
        return res.status(400).json({
          status: "fail",
          message: "At least 3 images are required.",
        });
      }

      // Auto-assign seller
      if (req.user) {
        req.body.seller = req.user._id;
      }

      // Handle location
      if (req.body.locationName) {
        try {
          // Convert name → [lng, lat]
          const coordinates = await getCoordinatesFromAddress(req.body.locationName);

          req.body.location = {
            type: "Point",
            coordinates
          };
        } catch (err) {
          console.error("Geocoding error:", err.message, err.response?.data);
          uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
          await sendNotificationToUser(req.user._id, title, message);



          return res.status(400).json({
            status: "fail",
            message: "Invalid location name. Could not fetch coordinates.",
          });
        }
      }

      // Store image paths
      req.body.images = uploadedFiles.map((file) => file.path);
    }
    console.log(Model, req.body)
    const doc = await Model.create(req.body);
    // sendNotificationToUser(req.user._id, "item", "Created Successfully")
    await  sendNotificationToUser(req.user._id, title, message);


    res.status(201).json({
      status: "success",
      data: doc,
    });
  } catch (err) {
    // Remove uploaded files only for Product
    if (Model.modelName === "Product") {
      uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
    }
    // sendNotificationToUser(req.user._id, Model, err.message)
    await sendNotificationToUser(req.user._id, `${Model.modelName} Creation Error`, err.message);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};



exports.getAll = (Model) => async (req, res) => {
  try {
    let docs;

    if (Model.modelName === "Product") {
      // Populate category name for products
      docs = await Model.find({ status: "approved" })
        .populate("category", "name")
        .populate("seller", "fullName profileImage")
        .exec();
    } else {
      // For other models, just hide password if it exists
      docs = await Model.find().select("-password");
    }

    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getOne = (Model) => async (req, res) => {
  try {
    let query;
    if (Model.modelName === "User") {
      query = Model.findById(req.user._id).select("-password");
    }
    // ✅ Check if the model is Product
    if (Model.modelName === "Product") {
      query = Model.findById(req.params.id).select("-password");
      query = query
        .populate("seller", "fullName profileImage") // only fullName and profileImage
        .populate("category", "name"); // only category name
    }

    const doc = await query;

    if (!doc) return res.status(404).json({ message: "Not found" });

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updateOne = (Model) => async (req, res) => {
  const uploadedFiles = req.files || []; // For multiple
  const uploadedFile = req.file || null; // For single (profileImage)
  const title = `${Model.modelName} `;
  const message = `${Model.modelName} updated successfully!`;
  try {
    // 🔹 Handle User password hashing
    if (Model.modelName === "User" && req.body.password) {
      const password = req.body.password;
      const isHashed =
        typeof password === "string" &&
        password.startsWith("$2") &&
        password.length === 60;

      if (!isHashed) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
    }

    // 🔹 Handle User profile image
    if (Model.modelName === "User" && uploadedFile) {
      // remove old image if exists
      const existingUser = await Model.findById(req.params.id);
      if (!existingUser) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(404).json({ message: "User not found" });
      }

      if (existingUser.profileImage && fs.existsSync(existingUser.profileImage)) {
        fs.unlinkSync(existingUser.profileImage);
      }

      req.body.profileImage = uploadedFile.path;
    }

    // 🔹 Handle Product-specific logic
    if (Model.modelName === "Product") {
      const existingProduct = await Model.findById(req.params.id);
      if (!existingProduct) {
        uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
        return res.status(404).json({ message: "Product not found" });
      }

      // 🔹 Parse existing and removed images from strings
      let existingImages = req.body.existingImages
        ? typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages
        : existingProduct.images || [];

      let removedImages = req.body.removedImages
        ? typeof req.body.removedImages === "string"
          ? JSON.parse(req.body.removedImages)
          : req.body.removedImages
        : [];

      let newImages = uploadedFiles.length > 0
        ? uploadedFiles.map((file) => file.path)
        : [];

      // 🔹 Calculate total images
      const totalCount = existingImages.length + newImages.length;

      if (totalCount < 3) {
        uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
        return res.status(400).json({
          status: "fail",
          message: `A product must have at least 3 images. Current: ${totalCount}`,
        });
      }

      // 🔹 Final image array
      let finalImages = existingImages.filter(
        (img) => !removedImages.includes(img)
      );
      finalImages = [...finalImages, ...newImages];

      req.body.images = finalImages;

      // 🔹 Assign seller if authenticated
      if (req.user) {
        req.body.seller = req.user._id;
      }

      // 🔹 Handle location update
      if (req.body.locationName) {
        try {
          const coordinates = await getCoordinatesFromAddress(req.body.locationName);
          req.body.location = {
            type: "Point",
            coordinates,
          };
        } catch (err) {
          console.error("Geocoding error:", err.message, err.response?.data);
          uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
          return res.status(400).json({
            status: "fail",
            message: "Invalid location name. Could not fetch coordinates.",
          });
        }
      }
    }
    // remove password if not updating
    if (Model.modelName === "User" && !req.body.password) {
      delete req.body.password;
    }

    // 🔹 Update the document
    const updatedDoc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select(Model.modelName === "User" ? "-password" : "");

    if (!updatedDoc) {
      if (uploadedFile) fs.unlinkSync(uploadedFile.path);
      return res.status(404).json({ message: "Not found" });
    }
    // Determine title based on model
    await sendNotificationToUser(req.user._id, title, message);

    res.json({
      status: "success",
      data: updatedDoc,
    });
  } catch (err) {
    if (Model.modelName === "Product") {
      uploadedFiles.forEach((file) => fs.unlinkSync(file.path));
    }
    if (Model.modelName === "User" && uploadedFile) {
      fs.unlinkSync(uploadedFile.path);
    }
    await sendNotificationToUser(req.user._id, `${Model.modelName} Update Error`, err.message);


    res.status(400).json({ error: err.message });
  }
};




exports.deleteOne = (Model) => async (req, res) => {
  try {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);
    if (!deletedDoc) return res.status(404).json({ message: "Not found" });
    // Determine title based on model
    const title = `${Model.modelName} `;
    const message = `${Model.modelName} has been deleted successfully.`;
    await sendNotificationToUser(req.user._id, title, message);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    await sendNotificationToUser(
      req.user._id,
      `${Model.modelName} Deletion Error`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};
