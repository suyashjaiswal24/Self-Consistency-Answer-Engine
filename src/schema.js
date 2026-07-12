import { z } from "zod";

export const LlmModelResponse = z.object({
  name: z.string(),
  output: z.string(),
});
