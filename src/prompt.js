import { createInterface } from "readline/promises";

export async function getUserPrompt(question = "You: ") {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}
