import "dotenv/config";
import { fetchAllResponse } from "../src/fetchAll.js";
import { evaluate } from "../src/evaluate.js";

const SYSTEM_PROMPT =
  "Always tell your LLM name(e.g. OpenAI, Claude, Gemini) first and then give the response. Make sure to follow zod schema LlmModelResponse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const responses = await fetchAllResponse(prompt, SYSTEM_PROMPT);
    const modelResponses = JSON.parse(responses);

    const evaluateResponse = await evaluate(prompt, responses);
    const evaluation = JSON.parse(evaluateResponse);

    res.status(200).json({ modelResponses, evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
