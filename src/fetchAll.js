import { askOpenAI } from "./models/openai.js";
import { askClaude } from "./models/claude.js";
import { askGemini } from "./models/gemini.js";

export async function fetchAllResponse(prompt, systemPrompt) {
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
