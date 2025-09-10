const mongoose = require("mongoose");
const Product = require("../models/Product");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: "../.env" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function embed(text) {
  const res = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,  // ✅ correct field is "contents"
  });

  return res.embeddings[0].values; // 3072-dim array
}

async function searchProducts(query) {
  await mongoose.connect(process.env.MONGO_URI);

  // 1️⃣ Get embedding for search query
  const queryEmbedding = await embed(query);

  // 2️⃣ Vector search in MongoDB
  const results = await Product.aggregate([
    {
      $vectorSearch: {
        index: "vector_index", // 👈 must match your Atlas index name
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 5,
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  console.log(`🔍 Search results for "${query}":`, results);

  await mongoose.disconnect();
}

searchProducts("headphone").catch((err) => {
  console.error("Error searching products:", err);
  mongoose.disconnect();
});
