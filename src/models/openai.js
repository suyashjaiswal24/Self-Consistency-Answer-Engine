import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { LlmModelResponse } from "../schema.js";

const openai = new OpenAI();

export const askOpenAI = async (prompt, systemPrompt) => {
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
