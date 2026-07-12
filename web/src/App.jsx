import { useState } from "react";

const MODEL_LABELS = {
  OpenAI: "OpenAI",
  Claude: "Claude",
  Gemini: "Gemini",
};

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelResponses, setModelResponses] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setEvaluation(null);
    setModelResponses([]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setModelResponses(data.modelResponses);
      setEvaluation(data.evaluation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Self-Consistency Answer Engine</h1>

      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          rows={3}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {modelResponses.length > 0 && (
        <section>
          <h2>Model Responses</h2>
          <div className="model-grid">
            {modelResponses.map((r, i) => (
              <div className="card" key={i}>
                <h3>{MODEL_LABELS[r.name] || r.name || "Error"}</h3>
                <p>{r.output || r.error}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {evaluation && (
        <section>
          <h2>Synthesized Answer</h2>
          <div className="card evaluation">
            <p>{evaluation.output}</p>
          </div>
        </section>
      )}
    </div>
  );
}
