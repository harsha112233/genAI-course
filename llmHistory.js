
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

async function main() {
    const history = [];

    while (true) {
        const question = readlineSync.question("You: ").trim();
        if (!question) {
            continue;
        }
        if (question.toLowerCase() === "exit") {
            console.log("Gemini: Goodbye!");
            break;
        }


        try {
            console.log("Sending request...");

            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: [
                    ...history,
                    {
                        role: "user",
                        parts: [{ text: question }],
                    },
                ],
                
            });

            console.log("Assistant:", response.text);

            history.push(
                {
                    role: "user",
                    parts: [{ text: question }],
                },
                {
                    role: "model",
                    parts: [{ text: response.text }],
                }
            );
        } catch (error) {
            console.error("Error:", error.message);
            console.error("Status:", error.status ?? "Unknown");
        } finally {
            console.timeEnd("API response");
        }
    }



}

main();
