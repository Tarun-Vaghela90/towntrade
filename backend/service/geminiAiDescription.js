const dotenv = require("dotenv");

dotenv.config({ path: '../.env' });


const fs = require("fs");
const { GoogleGenAI, Type } = require("@google/genai");
const KEY = process.env.GEMINI_API_KEY

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export async function geminiAIDesc(req,res) {
  try {
    const base64ImageFile = fs.readFileSync(
      '../uploads/products/1756366830051-Screenshot 2024-03-29 165344.png',
      { encoding: "base64" }
    );

    const contents = [
      {
        inlineData: {
          mimeType: "image/png", // ✅ Correct MIME type
          data: base64ImageFile,
        },
      },
      {
        text: "Create a detailed description of this product for the seller.",
      },
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              maxLength: 200, // ✅ limit to ~200 characters
            },
          },
          propertyOrdering: ["description"],
        },
      },

    });
    const data = JSON.parse(response.text)
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("❌ Failed to delete temp file:", err);
            } else {
                console.log("✅ Temp file deleted:", req.file.path);
            }
        });

    return data;
  } catch (err) {
    console.error("Error:", err);
  }
}

// consume returned data
geminiAIDesc().then(data => console.log(data));
