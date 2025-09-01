const mongoose = require("mongoose");

exports.ApiFeature = async (Model, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // 🔹 Base filters
  let filters = { status: "approved" };

  // 🔹 Category filter
  if (query.category) {
    filters.category = new mongoose.Types.ObjectId(query.category);
  }

  // 🔹 Price range filter
  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }

  // 🔹 City & Area filter
  if (query.city) filters.city = query.city;
  if (query.area) filters.area = query.area;

  // 🔹 Location name filter
  if (query.locationName) {
    filters.locationName = { $regex: query.locationName, $options: "i" };
  }

  // 🔹 Text search (title, description, brand, category name, locationName)
  if (query.search) {
    const Category = mongoose.model("Category");
    const categories = await Category.find(
      { name: { $regex: query.search, $options: "i" } },
      "_id"
    );
    const categoryIds = categories.map(c => c._id);

    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { brand: { $regex: query.search, $options: "i" } },
      { category: { $in: categoryIds } },
      { locationName: { $regex: query.search, $options: "i" } }
    ];
  }

  // 🔹 Sorting
  let sort = {};
  if (query.sort) {
    query.sort.split(",").forEach(field => {
      if (field.startsWith("-")) sort[field.substring(1)] = -1;
      else sort[field] = 1;
    });
  } else {
    sort = { isFeatured: -1, createdAt: -1 };
  }

  // 🔹 Aggregation pipeline
  let pipeline = [];

  // 🔹 Distance-based search (optional)
  if (query.lat && query.lng && query.radius) {
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    const radiusInMeters = parseFloat(query.radius) * 1000;

    pipeline.push({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        maxDistance: radiusInMeters,
        spherical: true,
        query: filters
      }
    });
  } else {
    pipeline.push({ $match: filters });
  }

  // 🔹 Sorting, skip, limit
  pipeline.push({ $sort: sort }, { $skip: skip }, { $limit: limit });

  // 🔹 Populate category details
  pipeline.push(
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
  );

  // 🔹 Count total items (without distance filter)
  const countPipeline = [{ $match: filters }, { $count: "totalItems" }];
  const countResult = await Model.aggregate(countPipeline);
  const totalItems = countResult.length > 0 ? countResult[0].totalItems : 0;
  const totalPages = Math.ceil(totalItems / limit);

  // 🔹 Fetch data
  const data = await Model.aggregate(pipeline);

  return {
    success: true,
    currentPage: page,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data
  };
};
