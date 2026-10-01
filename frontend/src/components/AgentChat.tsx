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
    <section className="space-y-3 rounded-lg border bg-white p-4">
      <div>
        <h2 className="font-semibold">Ask the assistant</h2>
        <p className="text-sm text-slate-600">
          Answers come from live report data via read-only tools.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => void ask(example)}
            disabled={loading}
            className="rounded-full border px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder="e.g. Which critical reports came in today?"
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {reply && (
        <div className="space-y-2 rounded-md bg-slate-50 p-3">
          <p className="whitespace-pre-wrap text-sm">{reply.answer}</p>
          <p className="text-xs text-slate-500">{toolsNote}</p>
        </div>
      )}
    </section>
  );
}