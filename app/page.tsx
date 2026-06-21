"use client";

import { useState } from "react";
import StatusChip from "@/components/StatusChip";
import {
  DEFAULT_EMAIL_DRAFT,
  DEFAULT_REPORT_NOTES,
  DEFAULT_TENDER_REQUIREMENTS,
} from "@/lib/prompts";

type Mode = "knowledge" | "report" | "email" | "tender";

const TABS: { id: Mode; label: string; eyebrow: string }[] = [
  { id: "knowledge", label: "Knowledge Q&A", eyebrow: "4.0 / 5.1" },
  { id: "report", label: "Weekly Report", eyebrow: "4.1" },
  { id: "email", label: "Email Drafting", eyebrow: "4.3" },
  { id: "tender", label: "Tender Matrix", eyebrow: "4.2" },
];

function parseMarkdownTable(md: string): { headers: string[]; rows: string[][] } | null {
  const lines = md.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
  if (lines.length < 2) return null;
  const toCells = (line: string) =>
    line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const headers = toCells(lines[0]);
  const rows = lines.slice(2).map(toCells);
  return { headers, rows };
}

function StatusBadgeForText({ text }: { text: string }) {
  const t = text.toLowerCase();
  if (t.includes("gap")) return <StatusChip status="red" label="GAP" />;
  if (t.includes("partial")) return <StatusChip status="amber" label="PARTIAL" />;
  if (t.includes("met")) return <StatusChip status="green" label="MET" />;
  return <span className="text-ink-soft">{text}</span>;
}

async function postAssistant(mode: Mode, input: string, tone?: string) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode, input, tone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-paper-raised p-6 shadow-sm">{children}</div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mt-3 rounded-sm bg-rag-red-bg px-3 py-2 text-sm text-rag-red">{message}</p>
  );
}

function KnowledgePanel() {
  const [question, setQuestion] = useState("What's our approach to data migration readiness?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    answer: string;
    status: "green" | "red";
    sources: string[];
  } | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAssistant("knowledge", question);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display text-xl">Knowledge Q&amp;A</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Answers only from a small sample knowledge base — not general knowledge. Asks that
        can&rsquo;t be sourced come back empty rather than guessed, by design.
      </p>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={2}
        className="mt-4 w-full rounded border border-line bg-paper p-3 text-sm focus:border-accent"
      />
      <div className="mt-3 flex items-center gap-3">
        <PrimaryButton onClick={run} disabled={loading}>
          {loading ? "Searching…" : "Ask"}
        </PrimaryButton>
      </div>
      {error && <ErrorNote message={error} />}
      {result && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-2 flex items-center gap-2">
            <StatusChip status={result.status} />
            <span className="text-xs text-ink-soft">
              {result.sources.length > 0
                ? `${result.sources.length} source(s) retrieved`
                : "no sources found"}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.answer}</p>
          {result.sources.length > 0 && (
            <ul className="mt-3 space-y-1 font-mono text-xs text-ink-soft">
              {result.sources.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

function ReportPanel() {
  const [notes, setNotes] = useState(DEFAULT_REPORT_NOTES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAssistant("report", notes);
      setAnswer(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display text-xl">Weekly Report Draft</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Paste rough notes → get a structured first-draft status report, including a delivery
        confidence rating. Always reviewed by a human before it goes to a client.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        className="mt-4 w-full rounded border border-line bg-paper p-3 font-mono text-xs leading-relaxed focus:border-accent"
      />
      <div className="mt-3">
        <PrimaryButton onClick={run} disabled={loading}>
          {loading ? "Drafting…" : "Draft report"}
        </PrimaryButton>
      </div>
      {error && <ErrorNote message={error} />}
      {answer && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </Card>
  );
}

function EmailPanel() {
  const [draft, setDraft] = useState(DEFAULT_EMAIL_DRAFT);
  const [tone, setTone] = useState("Diplomatic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAssistant("email", draft, tone);
      setAnswer(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display text-xl">Email Drafting</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Rewrites tone only — never adds commitments, dates or terms that weren&rsquo;t in your
        draft. Never auto-sends.
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        className="mt-4 w-full rounded border border-line bg-paper p-3 text-sm focus:border-accent"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="rounded border border-line bg-paper px-3 py-2 text-sm"
        >
          {["Concise", "Executive", "Firm", "Diplomatic"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <PrimaryButton onClick={run} disabled={loading}>
          {loading ? "Rewriting…" : "Rewrite email"}
        </PrimaryButton>
      </div>
      {error && <ErrorNote message={error} />}
      {answer && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </Card>
  );
}

function TenderPanel() {
  const [requirements, setRequirements] = useState(DEFAULT_TENDER_REQUIREMENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postAssistant("tender", requirements);
      setAnswer(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const table = answer ? parseMarkdownTable(answer) : null;

  return (
    <Card>
      <h3 className="font-display text-xl">Tender Compliance Matrix</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Simulates a future CWW <em>client</em> (a council, a health provider) sending CWW a
        tender. The sample below is a fictional client RFP excerpt — not the babyPM RFP itself.
      </p>
      <textarea
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        rows={5}
        className="mt-4 w-full rounded border border-line bg-paper p-3 font-mono text-xs leading-relaxed focus:border-accent"
      />
      <div className="mt-3">
        <PrimaryButton onClick={run} disabled={loading}>
          {loading ? "Building matrix…" : "Build compliance matrix"}
        </PrimaryButton>
      </div>
      {error && <ErrorNote message={error} />}
      {table && (
        <div className="mt-5 overflow-x-auto border-t border-line pt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                {table.headers.map((h) => (
                  <th key={h} className="py-2 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i} className="border-b border-line/60 align-top">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 pr-4">
                      {j === row.length - 1 ? <StatusBadgeForText text={cell} /> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {answer && !table && (
        <p className="mt-5 whitespace-pre-wrap border-t border-line pt-4 text-sm leading-relaxed">
          {answer}
        </p>
      )}
    </Card>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Mode>("knowledge");

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          CWW Project Delivery · Vendor Response
        </p>
        <h1 className="mt-2 font-display text-4xl italic leading-tight sm:text-5xl">
          babyPM
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          babyPM is an <strong>internal</strong> assistant for CWW&rsquo;s own staff — not a
          public-facing site, and not a government database. It works only against CWW&rsquo;s
          own knowledge library (reports, case studies, templates), with a human always
          reviewing before anything goes external. This page demonstrates four of its required
          workflows.
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-rag-amber bg-rag-amber-bg p-4">
          <StatusChip status="amber" label="PROTOTYPE" />
          <p className="text-sm text-ink">
            This is a fast concept demo on Supabase + Vercel, built to be tappable today. The
            proposed <strong>production</strong> architecture is Microsoft 365 / Azure OpenAI
            aligned, with Australian data hosting — see the note at the bottom of this page.
          </p>
        </div>
      </header>

      <nav className="mt-10 flex flex-wrap gap-2 border-b border-line pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-accent text-white"
                : "bg-paper-raised text-ink-soft hover:text-ink"
            }`}
          >
            <span className="mr-1.5 font-mono text-[10px] opacity-70">{t.eyebrow}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "knowledge" && <KnowledgePanel />}
        {tab === "report" && <ReportPanel />}
        {tab === "email" && <EmailPanel />}
        {tab === "tender" && <TenderPanel />}
      </div>

      <footer className="mt-14 border-t border-line pt-6 text-sm text-ink-soft">
        <p className="font-display text-base not-italic text-ink">Production architecture note</p>
        <p className="mt-2 leading-relaxed">
          This prototype proves the workflow concepts — RAG with citations, structured
          reporting, tone-controlled drafting, and RFP compliance mapping. The proposed
          production build is Microsoft 365 / Azure OpenAI aligned: SharePoint and OneDrive as
          the indexed knowledge source, a Teams-based chat interface, Outlook integration for
          drafting, Azure-hosted data within Australia, and no use of CWW data for public model
          training — matching Sections 5 and 6 of the RFP exactly.
        </p>
      </footer>
    </main>
  );
}
