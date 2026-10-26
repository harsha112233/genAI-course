
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
    retryOptions: { attempts: 1 },
  },
});

// Create a chat session with automatic history management
const chat = ai.chats.create({
  model: "gemini-3.5-flash-lite",
  config: {
    temperature: 0.7,
  },
});

async function main() {
 
  while (true) {
    const question = readlineSync.question("You: ").trim();

    if (question.toLowerCase() === "exit") {
      console.log("Goodbye!");
      break;
    }

    if (!question) continue;

    try {
      console.time("API response");

      const response = await chat.sendMessage({
        message: question,
      });

      console.log("\nGemini:", response.text, "\n");
      console.log();
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

main();
