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
    console.log("Sending request...\n");

    const response = await ai.models.generateContentStream({
      model: "gemini-3.5-flash-lite",
      contents: "What is Node.js?",
    });

    for await (const chunk of response) {
      if (chunk.text) {
        process.stdout.write(chunk.text);
      }
    }

    console.log("\n");
  } catch (error) {
    console.error("\nError:", error.message);
    console.error("Status:", error.status ?? "Unknown");
  } finally {
    console.timeEnd("API response");
  }
}

main();