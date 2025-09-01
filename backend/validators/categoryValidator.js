const { body } = require("express-validator");

exports.createCategoryValidator = [
    body("name")
        .notEmpty().withMessage("name is required"),
    body("parentCategory")
        .notEmpty().withMessage("parentCategory is required")
        .isMongoId().withMessage("parentCategory must be a valid ID")
];
