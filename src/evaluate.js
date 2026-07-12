import { askClaude } from "./models/claude.js";

export async function evaluate(prompt, responses) {
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
