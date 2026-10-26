
import "dotenv/config";
import { GoogleGenAI,Type } from "@google/genai";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
    retryOptions: { attempts: 1 },
  },
});

const userSchema = z.object({
  name: z.string().describe('The user\'s full name'),
  email: z.string().email().describe('The user\'s email address'),
  age: z.number().int().min(0).describe('The user\'s age'),
});

const jsonSchema = zodToJsonSchema(userSchema);

async function main() {
  console.time("API response");

  try {
    console.log("Sending request...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "give me 10 users data",
       config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: jsonSchema,

      },
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
