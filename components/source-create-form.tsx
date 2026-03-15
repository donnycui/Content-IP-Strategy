"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const sourceTypes = ["RSS", "WEBSITE", "NEWSLETTER", "MANUAL_URL", "SOCIAL_LINK", "DISCLOSURE", "BLOG"] as const;
const sourceTypeLabels: Record<(typeof sourceTypes)[number], string> = {
  RSS: "RSS",
  WEBSITE: "网站",
  NEWSLETTER: "Newsletter",
  MANUAL_URL: "手动 URL",
  SOCIAL_LINK: "社媒外链",
  DISCLOSURE: "公开披露",
  BLOG: "博客",
};

type FeedbackState =
  | { kind: "idle"; message: "" }
  | { kind: "success" | "error"; message: string };

export function SourceCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: "idle", message: "" });
  const [form, setForm] = useState({
    name: "",
    type: "WEBSITE",
    baseUrl: "",
    feedUrl: "",
    qualityScore: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback({ kind: "idle", message: "" });

        const response = await fetch("/api/sources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            baseUrl: form.baseUrl || null,
            feedUrl: form.feedUrl || null,
            qualityScore: form.qualityScore ? Number(form.qualityScore) : null,
          }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "创建信号源失败。");
        }

        setForm({
          name: "",
          type: "WEBSITE",
          baseUrl: "",
          feedUrl: "",
          qualityScore: "",
        });
        setFeedback({ kind: "success", message: "信号源已保存。" });
        router.refresh();
      } catch (error) {
        setFeedback({
          kind: "error",
          message: error instanceof Error ? error.message : "创建信号源失败。",
        });
      }
    });
  }

  return (
    <section className="panel px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-sky-200">新增信号源</p>
      <form className="mt-4 grid gap-4 lg:grid-cols-5" onSubmit={handleSubmit}>
        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm">名称</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Financial Times"
            required
            value={form.name}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">类型</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("type", event.target.value)}
            value={form.type}
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {sourceTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm">基础 URL</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("baseUrl", event.target.value)}
            placeholder="https://example.com"
            value={form.baseUrl}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">Feed URL</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => updateField("feedUrl", event.target.value)}
            placeholder="https://example.com/feed.xml"
            value={form.feedUrl}
          />
        </label>
        <label className="space-y-2 lg:col-span-1">
          <span className="text-sm">质量分</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            max="5"
            min="0"
            onChange={(event) => updateField("qualityScore", event.target.value)}
            placeholder="4.6"
            step="0.1"
            type="number"
            value={form.qualityScore}
          />
        </label>
        <div className="flex items-end">
          <button
            className="w-full rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            保存信号源
          </button>
        </div>
      </form>
      {feedback.kind !== "idle" ? (
        <p className={`mt-3 text-sm ${feedback.kind === "error" ? "text-rose-300" : "text-emerald-300"}`}>
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}
