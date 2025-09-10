// routes/aiRoutes.js
const express = require("express");
const { fetch_user } = require("../../middlewares/AuthMiddleware");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { GoogleGenAI, Type } = require("@google/genai");
const dotenv = require("dotenv");

// dotenv.config({ path: "../.env" });

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/temp/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Gemini init
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Utility function
async function geminiAIDesc(filePaths) {
  try {
    const contents = [];

    // Add all uploaded images
    filePaths.forEach((filePath) => {
      const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });
      contents.push({
        inlineData: {
          mimeType: filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")
            ? "image/jpeg"
            : "image/png",
          data: base64ImageFile,
        },
      });
    });

    // Add the prompt at the end
   contents.push({
  text: `You are helping me write a personal product listing like on OLX. 
First, carefully identify the visible brand name and product type from the image (for example: boAt earbuds, Samsung phone, Nike shoes, etc.). 
Then, write a short, natural description as if I am the seller writing it myself.

Guidelines:
- Tone: casual, first-person, trustworthy (e.g., "Hey everyone! Selling my boAt earbuds...").
- Mention the brand and product name right at the start.
- Highlight clear visible features (color, design, case/charging port, overall look).
- Be honest about condition (new, like new, used, etc.).
- Do not invent details that aren’t visible.
- Keep it 4 to 7 lines only.
- End with a friendly note like why it’s a good buy or why I’m letting it go.
- The output should feel human-written, not like a technical review.
`
});


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ai_description: {
              type: Type.STRING,
              maxLength: 600,
            },
          },
          propertyOrdering: ["ai_description"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error("❌ Gemini error:", err);
    throw err;
  }
}


// Route
// Route
router.post("/aidesc", fetch_user, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const filePaths = req.files.map((f) => f.path);

    const data = await geminiAIDesc(filePaths);

    // Delete temp files
    filePaths.forEach((filePath) => {
      fs.unlink(filePath, (err) => {
        if (err) console.error("❌ Failed to delete temp file:", err);
        else console.log("✅ Temp file deleted:", filePath);
      });
    });

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate description" });
  }
});


module.exports = router;
