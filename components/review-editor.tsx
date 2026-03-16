"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ReviewEditorProps = {
  signalId: string;
  initialReview?: {
    reviewStatus: "PENDING" | "KEPT" | "REJECTED" | "DEFERRED";
    adjustedImportanceScore?: number | null;
    adjustedViewpointScore?: number | null;
    adjustedConsensusStrength?: number | null;
    adjustedCompanyRoutineScore?: number | null;
    adjustedPriorityRecommendation?: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE" | null;
    reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED" | null;
    reviewNote?: string | null;
    myAngle?: string | null;
  };
};

export function ReviewEditor({ signalId, initialReview }: ReviewEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    reviewStatus: initialReview?.reviewStatus ?? "PENDING",
    adjustedImportanceScore: initialReview?.adjustedImportanceScore?.toString() ?? "",
    adjustedViewpointScore: initialReview?.adjustedViewpointScore?.toString() ?? "",
    adjustedConsensusStrength: initialReview?.adjustedConsensusStrength?.toString() ?? "",
    adjustedCompanyRoutineScore: initialReview?.adjustedCompanyRoutineScore?.toString() ?? "",
    adjustedPriorityRecommendation: initialReview?.adjustedPriorityRecommendation ?? "WATCH",
    reasoningAcceptance: initialReview?.reasoningAcceptance ?? "PARTIAL",
    reviewNote: initialReview?.reviewNote ?? "",
    myAngle: initialReview?.myAngle ?? "",
  });

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toNumber(value: string) {
    if (!value.trim()) {
      return undefined;
    }

    return Number(value);
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signalId,
            reviewStatus: form.reviewStatus,
            adjustedImportanceScore: toNumber(form.adjustedImportanceScore),
            adjustedViewpointScore: toNumber(form.adjustedViewpointScore),
            adjustedConsensusStrength: toNumber(form.adjustedConsensusStrength),
            adjustedCompanyRoutineScore: toNumber(form.adjustedCompanyRoutineScore),
            adjustedPriorityRecommendation: form.adjustedPriorityRecommendation,
            reasoningAcceptance: form.reasoningAcceptance,
            reviewNote: form.reviewNote || undefined,
            myAngle: form.myAngle || undefined,
          }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "Failed to save review.");
        }

        setFeedback("已保存人工复核。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "保存复核失败。");
      }
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-black/10 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">复核状态</span>
          <select
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("reviewStatus", event.target.value as typeof form.reviewStatus)}
            value={form.reviewStatus}
          >
            <option value="PENDING">待处理</option>
            <option value="KEPT">保留</option>
            <option value="DEFERRED">延后</option>
            <option value="REJECTED">忽略</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">优先级建议</span>
          <select
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) =>
              updateField("adjustedPriorityRecommendation", event.target.value as typeof form.adjustedPriorityRecommendation)
            }
            value={form.adjustedPriorityRecommendation}
          >
            <option value="PRIORITIZE">优先推进</option>
            <option value="WATCH">持续观察</option>
            <option value="DEPRIORITIZE">降低优先级</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">人工调整后的重要性</span>
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("adjustedImportanceScore", event.target.value)}
            placeholder="1 到 5"
            value={form.adjustedImportanceScore}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">人工调整后的观点潜力</span>
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("adjustedViewpointScore", event.target.value)}
            placeholder="1 到 5"
            value={form.adjustedViewpointScore}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">人工调整后的共识强度</span>
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("adjustedConsensusStrength", event.target.value)}
            placeholder="1 到 5"
            value={form.adjustedConsensusStrength}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-slate-700">人工调整后的公司日常噪音</span>
          <input
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("adjustedCompanyRoutineScore", event.target.value)}
            placeholder="1 到 5"
            value={form.adjustedCompanyRoutineScore}
          />
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="text-slate-700">理由接受度</span>
          <select
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("reasoningAcceptance", event.target.value as typeof form.reasoningAcceptance)}
            value={form.reasoningAcceptance}
          >
            <option value="ACCEPTED">接受</option>
            <option value="PARTIAL">部分接受</option>
            <option value="REJECTED">不接受</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="text-slate-700">复核备注</span>
          <textarea
            className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("reviewNote", event.target.value)}
            placeholder="你为什么接受或不接受 AI 的判断框架。"
            value={form.reviewNote}
          />
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="text-slate-700">我的切入角度</span>
          <textarea
            className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            onChange={(event) => updateField("myAngle", event.target.value)}
            placeholder="你的差异化切口，或这条内容不应该讲的原因。"
            value={form.myAngle}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
          onClick={handleSubmit}
          type="button"
        >
          保存人工复核
        </button>
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </section>
  );
}
