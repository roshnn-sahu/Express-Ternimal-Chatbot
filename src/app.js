import express from "express";
import readline from "readline/promises";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
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

while (true) {
  const prompt = await rl.question("You: ");

  const response = await model.stream(prompt);

  for await (const message of response) {
    process.stdout.write(message.content);
  }
  process.stdout.write("\n");
}
process.stdout.write("\n");

export default app;
