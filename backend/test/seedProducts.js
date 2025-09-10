require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("../models/Product");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function seedProducts() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    const dummyCategory = new mongoose.Types.ObjectId(); 
    const dummySeller = new mongoose.Types.ObjectId();

    // 🔹 Load real products from JSON file
    const rawData = fs.readFileSync("./products.json");
    const realProducts = JSON.parse(rawData);

    // 🔹 Extract text for embeddings
    const texts = realProducts.map(
      (p) => `${p.title}. ${p.description}`
    );

    // 🔹 Generate embeddings
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: texts,
      outputDimensionality: 3072,
      taskType: "SEMANTIC_SIMILARITY",
    });

    const embeddings = response.embeddings
      ? response.embeddings.map((e) => e.values)
      : response.responses.map((r) => r.embedding.values);

    console.log(`✅ Got ${embeddings.length} embeddings with dimension ${embeddings[0].length}`);

    // 🔹 Build product docs with embeddings
    const products = realProducts.map((p, i) => ({
      ...p,
      category: dummyCategory,
      seller: dummySeller,
      location: { type: "Point", coordinates: [72.5714, 23.0225] },
      embedding: embeddings[i],
    }));

    await Product.insertMany(products);
    console.log(`🎉 Inserted ${products.length} real products with embeddings`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Error seeding products:", err);
    await mongoose.disconnect();
  }
}

seedProducts();
