import { GoogleGenAI, Type } from '@google/genai';
import readlineSync from "readline-sync"
import 'dotenv/config'



// Configure the client
const ai = new GoogleGenAI({});


// crypto currency tool
async function cryptoCurrency({coin}) {

  const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${coin}`);
  const data = await response.json();
  return data;
}

// weather tool

async function weatherInformation({city}) {
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&aqi=no`);
    const data = await response.json();
    // console.log(data);

    return data;
}





// cryptcurrency wale ki information karke

const cryptoInfo = {
    name:"cryptoCurrency",
    description: "We can give you the current price or other information related to cryptocurrency like bitcoin and ethereum etc",
    parameters: {
        type: Type.OBJECT,
        properties: {
            coin:{
                type:Type.STRING,
                description: "It will be the name of the cryptocurrency like bitcoin, ethereum, etc"
            }
        },
        required:['coin']
    }
}


const weatherInfo = {
    name: "weatherInformation",
    description: "You can get the current weather information of any city like london, goa etc",
    parameters:{
        type:Type.OBJECT,
        properties:{
            city:{
                type:Type.STRING,
                description:"Name of the city for which I have to fetch weather information like london, goa etc"
            }
        },
        required:['city']
    }
}


const tools = [{
    functionDeclarations: [cryptoInfo,weatherInfo]
}];


const toolFunctions = {
    "cryptoCurrency": cryptoCurrency,
    "weatherInformation":weatherInformation
}

const History = [];



async function main() {
  while (true) {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: History,
      config: { tools },
    });

    const functionCalls = result.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      console.log("My function is called");

      // IMPORTANT: Preserve the complete model response,
      // including thought_signature.
      History.push(result.candidates[0].content);

      // Execute all requested function calls
      const functionResponses = await Promise.all(
        functionCalls.map(async (functionCall) => {
          const { name, args } = functionCall;

          const toolFunction = toolFunctions[name];

          if (!toolFunction) {
            throw new Error(`Unknown tool: ${name}`);
          }

          const response = await toolFunction(args);

          return {
            functionResponse: {
              name,
              response: {
                result: response,
              },
            },
          };
        })
      );

      // Send function responses back to Gemini
      History.push({
        role: "user",
        parts: functionResponses,
      });

    } else {
      // Preserve complete model response
      History.push(result.candidates[0].content);

      console.log(result.text);
      break;
    }
  }
}



while(true){
    
    const question = readlineSync.question('Ask me anything: ');

    if(question == 'exit'){
        break;
    }

    History.push({
        role:'user',
        parts:[{text:question}]
    });

    await main();
}