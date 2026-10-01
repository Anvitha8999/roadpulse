"use client";

import { useState, type FormEvent } from "react";

interface AgentReply {
  answer: string;
  tools_used: string[];
}

const EXAMPLES = [
  "What are the 3 most severe reports?",
  "Which reports need review?",
  "Give me a quick overview of all reports.",
];

export default function AgentChat() {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<AgentReply | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setQuestion(trimmed);
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof body?.detail === "string" ? body.detail : "The assistant couldn't answer. Try again.",
        );
        return;
      }
      setReply(body as AgentReply);
    } catch {
      setError("Couldn't reach the assistant.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  const toolsNote = reply
    ? reply.tools_used.length
      ? "Data from: " + reply.tools_used.join(", ")
      : "No tools used. This answer isn't based on report data."
    : "";

  return (
    <section className="rounded-xl border border-curb bg-white p-5">
      <h2 className="text-lg font-extrabold">Ask about the reports</h2>
      <p className="mt-0.5 text-sm text-muted">
        The assistant answers from live report data using read-only tools.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => void ask(example)}
            disabled={loading}
            className="rounded-full border border-curb px-3 py-1.5 text-sm text-ink hover:border-sign hover:text-sign disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          aria-label="Question for the assistant"
          placeholder="Which critical reports came in today?"
          className="min-w-0 flex-1 rounded-lg border border-curb bg-white px-3 py-2 text-sm focus:border-sign focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg bg-sign px-5 py-2 text-sm font-bold text-white hover:bg-sign-dark disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border-l-4 border-sev-5 bg-sev-5/10 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {reply && (
        <div className="mt-3 rounded-lg border-l-4 border-sign bg-concrete/60 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.answer}</p>
          <p className="mt-2 text-xs text-muted">{toolsNote}</p>
        </div>
      )}
    </section>
  );
}
