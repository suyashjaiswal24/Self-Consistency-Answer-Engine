import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import "dotenv/config";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createInterface } from "readline/promises";

const openai = new OpenAI();
const gemini = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const claude = new Anthropic();

const LlmModelResponse = z.object({
  name: z.string(),
  output: z.string(),
});

const askOpenAI = async (prompt, systemPrompt) => {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    text: { format: zodTextFormat(LlmModelResponse, "openai_response") },
  });
  return response.output_text;
};

const askClaude = async (prompt, systemPrompt) => {
  const message = await claude.messages.create({
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
    model: "claude-haiku-4-5",
    output_config: { format: zodOutputFormat(LlmModelResponse) },
  });
  let result = "";
  for (const block of message.content) {
    if (block.type === "text") {
      result += block.text;
    }
  }
  return result;
};

const askGemini = async (prompt, systemPrompt) => {
  const response = await gemini.interactions.create({
    model: "gemini-3.5-flash",
    input: prompt,
    system_instruction: systemPrompt,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: z.toJSONSchema(LlmModelResponse),
    },
  });
  return response.output_text;
};

async function fetchAllResponse(prompt, systemPrompt) {
  const promises = [
    askOpenAI(prompt, systemPrompt),
    askClaude(prompt, systemPrompt),
    askGemini(prompt, systemPrompt),
  ];

  const values = await Promise.allSettled(promises);

  const results = values.map((v) =>
    v.status === "fulfilled"
      ? JSON.parse(v.value)
      : { error: v.reason.message },
  );
  console.log(results);
  return JSON.stringify(results);
}

async function evaluate(prompt, responses) {
  const systemPromptForEvaluater = `You are a Lead Synthesizer and Evaluator AI.
    A user asked the following question:
    "${prompt}"

    Below are candidate answers provided by different AI models:

    ${responses}

    Your task:
    1. Compare all outputs for factual accuracy, reasoning depth, clarity, and edge-case handling.
    2. Filter out hallucination, weak explanations, or redundant phrasing.
    3. Combine the strongest, most accurate, and most useful points from all answers into one clear, authoritative, and well-structured final response.
    4. Mention your name as Evaluater and then give response. Follow zod structure: LlmModelResponse`;

  return await askClaude(prompt, systemPromptForEvaluater);
}

async function main() {
  const systemPrompt =
    "Always tell your LLM name(e.g. OpenAI, Claude, Gemini) first and then give the response. Make sure to follow zod schema LlmModelResponse";
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const userPrompt = await rl.question("You: ");
  rl.close();

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
