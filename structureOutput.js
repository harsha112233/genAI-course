
import "dotenv/config";
import { GoogleGenAI,Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
    retryOptions: { attempts: 1 },
  },
});

const userSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id:{
            type: Type.INTEGER,
            description: "The user's unique identifier",
        },
      name: {
        type: Type.STRING,
        description: "The user's full name",
      },
      email: {
        type: Type.STRING,
        description: "The user's email address",
      },
      age: {
        type: Type.INTEGER,
        description: "The user's age",
      },
    },
    required: ["name", "email", "age"],
     
  },
};

async function main() {
  console.time("API response");

  try {
    console.log("Sending request...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "give me 10 users data",
       config: {
        responseMimeType: "application/json",
        responseSchema: userSchema,
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
