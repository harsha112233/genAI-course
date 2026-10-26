
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
    retryOptions: { attempts: 1 },
  },
});

async function main() {
  console.time("API response");

  try {
    console.log("Sending request...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "How does AI work? Explain in 3 short sentences.",
    });

    console.log("Response:", response.text);
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Status:", error.status ?? "Unknown");
  } finally {
    console.timeEnd("API response");
  }
}

main();
