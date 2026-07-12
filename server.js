import "dotenv/config";
import express from "express";
import cors from "cors";
import { fetchAllResponse } from "./src/fetchAll.js";
import { evaluate } from "./src/evaluate.js";

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT =
  "Always tell your LLM name(e.g. OpenAI, Claude, Gemini) first and then give the response. Make sure to follow zod schema LlmModelResponse";

app.post("/api/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    const responses = await fetchAllResponse(prompt, SYSTEM_PROMPT);
    const modelResponses = JSON.parse(responses);

    const evaluateResponse = await evaluate(prompt, responses);
    const evaluation = JSON.parse(evaluateResponse);

    res.json({ modelResponses, evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
