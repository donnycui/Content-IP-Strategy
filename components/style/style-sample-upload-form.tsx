"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { StyleSampleCreateResponse } from "@/lib/domain/contracts";

export function StyleSampleUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function submit() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/style/samples", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            sourceLabel,
            sampleText,
          }),
        });

        const result = (await response.json()) as StyleSampleCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "新增风格样本失败。" : (result.error ?? "新增风格样本失败。"));
        }

        setFeedback(`已新增样本：${result.data.sample.title}`);
        setTitle("");
        setSourceLabel("");
        setSampleText("");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "新增风格样本失败。");
      }
    });
  }

  return (
    <section className="subpanel px-4 py-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">录入风格样本</p>
          <p className="muted text-sm leading-7">先录你最满意的原创内容，不要先喂 AI 改写稿。样本越贴近你自己，style skill 越快成形。</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.9fr,0.9fr]">
          <input
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="样本标题"
            value={title}
          />
          <input
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
            onChange={(event) => setSourceLabel(event.target.value)}
            placeholder="来源说明，例如：公众号、朋友圈长文、历史手稿"
            value={sourceLabel}
          />
        </div>

        <textarea
          className="min-h-48 w-full rounded-2xl border px-4 py-3 text-sm leading-7 outline-none transition"
          onChange={(event) => setSampleText(event.target.value)}
          placeholder="粘贴你自己的原始文案。"
          value={sampleText}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={submit}
            type="button"
          >
            {isPending ? "录入中..." : "录入样本"}
          </button>
          {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
          {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        </div>
      </div>
    </section>
  );
}
