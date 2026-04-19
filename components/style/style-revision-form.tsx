"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { StyleRevisionCreateResponse } from "@/lib/domain/contracts";

export function StyleRevisionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draftText, setDraftText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [ruleDelta, setRuleDelta] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function submit() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/style/revisions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draftText,
            revisedText,
            ruleDelta,
          }),
        });

        const result = (await response.json()) as StyleRevisionCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "记录风格修订失败。" : (result.error ?? "记录风格修订失败。"));
        }

        setFeedback("已记录一条风格修订信号。");
        setDraftText("");
        setRevisedText("");
        setRuleDelta("");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "记录风格修订失败。");
      }
    });
  }

  return (
    <section className="subpanel px-4 py-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">记录手改修订</p>
          <p className="muted text-sm leading-7">把 AI 初稿和你手改后的版本一起交给系统，风格层才能真正从差异中学习，而不是重复模板化提示词。</p>
        </div>

        <textarea
          className="min-h-32 w-full rounded-2xl border px-4 py-3 text-sm leading-7 outline-none transition"
          onChange={(event) => setDraftText(event.target.value)}
          placeholder="粘贴 AI 初稿"
          value={draftText}
        />

        <textarea
          className="min-h-32 w-full rounded-2xl border px-4 py-3 text-sm leading-7 outline-none transition"
          onChange={(event) => setRevisedText(event.target.value)}
          placeholder="粘贴你手改后的版本"
          value={revisedText}
        />

        <input
          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
          onChange={(event) => setRuleDelta(event.target.value)}
          placeholder="你这次最关键的改动规律，例如：删掉空话开场，句子变短，更像口语"
          value={ruleDelta}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={submit}
            type="button"
          >
            {isPending ? "记录中..." : "记录修订"}
          </button>
          {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
          {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        </div>
      </div>
    </section>
  );
}
