import express from "express";
import readline from "readline/promises";
import dotenv from "dotenv";
import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey = process.env.OPENROUTER_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const model = new ChatOpenRouter({
  apiKey: apiKey,
  model: "ling-3.0-flash-fin:free",
});

//Messages Array
const messages = [
  new SystemMessage(
    "Your name is ROCK AI and You are a helpful assistant that translates natural language to code. You will be given a prompt and you will respond with the code that accomplishes the task. If the prompt is not clear, ask for clarification.",
  ),
];

while (true) {
  const prompt = await rl.question("You: ");
  messages.push(new HumanMessage(prompt));

  const response = await model.stream(messages);

  let LLMMessage = "";
  for await (const message of response) {
    process.stdout.write(message.content);
    LLMMessage += message.content;
  }

  messages.push(new AIMessage(LLMMessage));
  process.stdout.write("\n");
}
process.stdout.write("\n");

export default app;
