"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getMotherThemeLabel, getSourceNameLabel } from "@/lib/display";
import type { SourceRow } from "@/lib/source-data";

const motherThemes = [
  "Technological revolutions rewrite power structures",
  "Capital flows reveal era choices",
  "Business models are re-evaluated in a new cycle",
  "Individuals and organizations should reposition",
] as const;

type FeedbackState =
  | { kind: "idle"; message: "" }
  | { kind: "success" | "error"; message: string };

export function SignalCreateForm({ sources }: { sources: SourceRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: "idle", message: "" });
  const [form, setForm] = useState({
    sourceId: sources[0]?.id ?? "",
    title: "",
    url: "",
    summary: "",
    topicTags: "",
    motherTheme: motherThemes[0],
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback({ kind: "idle", message: "" });

        const response = await fetch("/api/signals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceId: form.sourceId,
            title: form.title,
            url: form.url,
            summary: form.summary || null,
            topicTags: form.topicTags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            motherTheme: form.motherTheme,
          }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "创建信号失败。");
        }

        setForm({
          sourceId: sources[0]?.id ?? "",
          title: "",
          url: "",
          summary: "",
          topicTags: "",
          motherTheme: motherThemes[0],
        });
        setFeedback({ kind: "success", message: "信号已保存。" });
        router.refresh();
      } catch (error) {
        setFeedback({
          kind: "error",
          message: error instanceof Error ? error.message : "创建信号失败。",
        });
      }
    });
  }

  return (
    <section className="panel px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-600">新增信号</p>
      <form className="mt-4 grid gap-4 lg:grid-cols-6" onSubmit={handleSubmit}>
        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm">标题</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="一条政策信号、战略动作或关键市场变化..."
            required
            value={form.title}
          />
        </label>
        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm">URL</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("url", event.target.value)}
            placeholder="https://example.com/article"
            required
            value={form.url}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">信号源</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("sourceId", event.target.value)}
            required
            value={form.sourceId}
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {getSourceNameLabel(source.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm">母命题</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("motherTheme", event.target.value)}
            value={form.motherTheme}
          >
            {motherThemes.map((theme) => (
              <option key={theme} value={theme}>
                {getMotherThemeLabel(theme)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 lg:col-span-4">
          <span className="text-sm">摘要</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("summary", event.target.value)}
            placeholder="这条信息为什么不只是表层新闻"
            value={form.summary}
          />
        </label>
        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm">主题标签</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("topicTags", event.target.value)}
            placeholder="AI、Capex、云、政策"
            value={form.topicTags}
          />
        </label>
        <div className="flex items-end lg:col-span-1">
          <button
            className="w-full rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || !sources.length}
            type="submit"
          >
            保存信号
          </button>
        </div>
      </form>
      {feedback.kind !== "idle" ? (
        <p className={`mt-3 text-sm ${feedback.kind === "error" ? "text-rose-600" : "text-emerald-700"}`}>
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}
