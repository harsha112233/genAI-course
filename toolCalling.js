
import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";
import readlineSync from "readline-sync";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 60000,
    retryOptions: { attempts: 1 },
  },
});

const weatherTool = {
  name: "getWeather",
  description: "Gets the current weather for a given city in India.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      cityname: {
        type: Type.STRING,
        description: "The city name, such as Solapur or Pune",
      },
    },
    required: ["cityname"],
  },
};

const chat = ai.chats.create({
  model: "gemini-3.5-flash-lite",
  config: {
    temperature: 0.7,
    tools: [{ functionDeclarations: [weatherTool] }],
  },
});

// Actual tool implementation
async function getWeather({ cityname }) {
  const url = new URL(
    "https://api.openweathermap.org/data/2.5/weather"
  );

  url.search = new URLSearchParams({
    q: `${cityname},IN`,
    appid: process.env.WEATHER_API_KEY,
    units: "metric",
  }).toString();

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `Weather API error: ${response.status}`
    );
  }

  return {
    city: data.name,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    condition: data.weather[0]?.description,
    humidity: data.main.humidity,
  };
}

async function getCryptoPrice({ coin }) {
    const response =await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=inr,usd`)
    const data = await response.json();
    console.log("data:", data);
    // return data[coin];
    
}


const functionMap = {
  getWeather,
};

async function askGemini(question) {
  let response = await chat.sendMessage({
    message: question,
  });


  // Handle tool calls until Gemini returns a normal answer
  while (response.functionCalls?.length) {
    console.log("response.functionCalls:", response.functionCalls);
    const functionResponses = [];

    for (const call of response.functionCalls) {
      console.log(`Calling tool: ${call.name}`);
      console.log("Arguments:", call.args);

      const fn = functionMap[call.name];

      if (!fn) {
        functionResponses.push({
          functionResponse: {
            name: call.name,
            id: call.id,
            response: { error: "Unknown function" },
          },
        });
        continue;
      }

      try {
        // fun(weatherTool({"solapur"}))
        const result = await fn(call.args);

        functionResponses.push({
          functionResponse: {
            name: call.name,
            id: call.id,
            response: { result },
          },
        });
      } catch (error) {
        functionResponses.push({
          functionResponse: {
            name: call.name,
            id: call.id,
            response: { error: error.message },
          },
        });
      }
    }

    // Send tool results back to Gemini
    response = await chat.sendMessage({
      message: functionResponses,
    });
  }

  console.log("\nGemini:", response.text ?? "(No text response)", "\n");
}

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
      await askGemini(question);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      console.timeEnd("API response");
    }
  }
}

main();
