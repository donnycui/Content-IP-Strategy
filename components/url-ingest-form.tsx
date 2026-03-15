"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SourceRow } from "@/lib/source-data";

export function UrlIngestForm({ sources }: { sources: SourceRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");

        const response = await fetch("/api/ingest/url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceId,
            url,
          }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
          created?: boolean;
          signalId?: string;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "URL 抓取入库失败。");
        }

        setFeedback(
          result.created
            ? `URL 已抓取并保存为信号 ${result.signalId}。`
            : `该 URL 已存在，对应信号 ${result.signalId}。`,
        );
        setUrl("");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "URL 抓取入库失败。");
      }
    });
  }

  return (
    <section className="panel px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-sky-200">抓取 URL</p>
      <form className="mt-4 grid gap-4 lg:grid-cols-[2fr,1fr,auto]" onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="text-sm">文章 URL</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
            required
            type="url"
            value={url}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm">信号源</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
            onChange={(event) => setSourceId(event.target.value)}
            required
            value={sourceId}
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            className="w-full rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || !sources.length}
            type="submit"
          >
            {isPending ? "抓取中..." : "抓取 URL"}
          </button>
        </div>
      </form>
      {feedback ? <p className="mt-3 text-sm text-emerald-300">{feedback}</p> : null}
    </section>
  );
}
