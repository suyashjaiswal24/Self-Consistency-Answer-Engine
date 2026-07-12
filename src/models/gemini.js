import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { LlmModelResponse } from "../schema.js";

const gemini = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const askGemini = async (prompt, systemPrompt) => {
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
