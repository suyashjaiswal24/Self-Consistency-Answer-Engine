import "dotenv/config";
import { getUserPrompt } from "./src/prompt.js";
import { fetchAllResponse } from "./src/fetchAll.js";
import { evaluate } from "./src/evaluate.js";

async function main() {
  const systemPrompt =
    "Always tell your LLM name(e.g. OpenAI, Claude, Gemini) first and then give the response. Make sure to follow zod schema LlmModelResponse";
  const userPrompt = await getUserPrompt();

  const responses = await fetchAllResponse(userPrompt, systemPrompt);

  if (!responses || responses.length === 0) {
    console.log(
      "All model calls failed. Please check your API keys or network.",
    );
  }

  const evaluateResponse = await evaluate(userPrompt, responses);

  console.log("Evaluated response: ", JSON.parse(evaluateResponse));
}

main();
