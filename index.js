import 'dotenv/config';
import OpenAI from "openai";
import readlineSync from 'readline-sync';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEATHERSTACK_API_KEY = process.env.WEATHERSTACK_API_KEY;

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
})

async function getWeatherDetails(city = '') {
    try {
        const response = await axios.get(`http://api.weatherstack.com/current`, {
            params: {
                access_key: WEATHERSTACK_API_KEY,
                query: city
            }
        });
        const temperature = response.data.current.temperature;
        return `${temperature}°C`;
    } catch (error) {
        console.error(`Error fetching weather details:`, error);
        return `Could not fetch weather details for ${city}`;
    }
}

const tools = {
    "getWeatherDetails": getWeatherDetails
}

const SYSTEM_PROMPT = `
You are an AI assistant with START, PLAN, ACTION, OBSERVATION, and OUTPUT states. 
Wait for the user prompt and first PLAN using available tools. 
After planning, take action with the appropriate tools and wait for observations based on the action. 
Once you get the observations, return the AI response based on the START prompt and observations.

Strictly follow the JSON format and do not deviate.

Available Tools:
- function getWeatherDetails(city: string): string -> Returns the weather details of a city.

Example:
START
{"type": "user", "user": "What is the weather of Sacramento and Los Angeles?"}
{"type": "plan", "plan": "I need to get the weather of Sacramento and Los Angeles. I will use the getWeather API tool to get the weather of Sacramento and Los Angeles."}
{"type": "action", "action": {"function": "getWeatherDetails", "input": "Sacramento"}}
{"type": "observation", "observation": "The weather of Sacramento is 20 degree celcius"}
{"type": "action", "action": {"function": "getWeatherDetails", "input": "Los Angeles"}}
{"type": "observation", "observation": "The weather of Los Angeles is 25 degree celcius"}
{"type": "output", "output": "The weather of Sacramento is 20 degree celcius and the weather of Los Angeles is 25 degree celcius."}
`

const messages = [{ role: "system", content: SYSTEM_PROMPT }]

while (true) {
    const query = readlineSync.question(">> ");
    const q = {
        type: 'user',
        user: query
    };
    messages.push({ role: "user", content: JSON.stringify(q) });

    while (true) {
        const chat = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            response_format: { type: 'json_object' },
        });
    
        const result = chat.choices[0].message.content;
        messages.push({ role: "assistant", content: result });
    
        const call = JSON.parse(result);
    
        if (call.type === "output") {
            console.log(`🤖: ${call.output}`);
            break;
        } else if (call.type === "action") {
            console.log("Resolving function call:", call.action.function);
            const fn = tools[call.action.function];
            if (!fn) {
                console.error(`Function ${call.action.function} not found in tools.`);
                break;
            }
    
            try {
                const observation = await fn(call.action.input);
                const obs = {
                    type: 'observation',
                    observation: observation
                }
                messages.push({ role: "developer", content: JSON.stringify(obs) });
            } catch (error) {
                console.error(`Error executing function ${call.action.function}:`, error);
                break;
            }
        }
    }
}