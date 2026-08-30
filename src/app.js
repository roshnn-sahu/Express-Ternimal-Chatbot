import express from "express";
import readline from "readline/promises";
import dotenv from "dotenv";
import * as zod from "zod";
import { tavily } from "@tavily/core";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  tool,
  createAgent,
} from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "ling-3.0-flash-fin:free",
});
//TOOl Function
function getCurrentDate({ query }) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
async function getInfoFromWeb({ query }) {
  const response = await tvly.search(query);
  const content = response.results
    .map((result) => result.content)
    .join("\n\n\n");
  return content;
}
//LLm Tool

const getTodayDate = tool(getCurrentDate, {
  name: "get_current_date",
  description: "Get the current date in YYYY-MM-DD format",
  schema: zod.object({
    query: zod.string().optional().describe("Optional query parameter"),
  }),
});

const getFromWeb = tool(getInfoFromWeb, {
  name: "get_info_from_web",
  description: "Get information from the web based on a search query",
  schema: zod.object({
    query: zod
      .string()
      .describe("The search query to retrieve information from the web"),
  }),
});

//Messages Array
const messages = [
  new SystemMessage(
    "Your name is ROCK AI and You are a helpful assistant that translates natural language to code. You will be given a prompt and you will respond with the code that accomplishes the task. If the prompt is not clear, ask for clarification.",
  ),
];

//AGENTs

const agent = createAgent({
  model: model,
  tools: [getTodayDate, getFromWeb],
});

while (true) {
  const prompt = await rl.question("You: ");
  messages.push(new HumanMessage(prompt));

  const response = await agent.stream({ messages }, { streamMode: "messages" });

  let LLMMessage = "";
  for await (const [message] of response) {
    process.stdout.write(message.content);
    LLMMessage += message.content;
  }

  messages.push(new AIMessage(LLMMessage));
  process.stdout.write("\n");
}
process.stdout.write("\n");

export default app;
