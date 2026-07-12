import { Anthropic } from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { LlmModelResponse } from "../schema.js";

const claude = new Anthropic();

export const askClaude = async (prompt, systemPrompt) => {
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
