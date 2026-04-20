"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EvolutionDashboardPayload, EvolutionDecisionGenerateResponse } from "@/lib/domain/contracts";
import { EvolutionDecisionStatusActions } from "@/components/evolution/evolution-decision-status-actions";

export function EvolutionDecisionPanel({ dashboard }: { dashboard: EvolutionDashboardPayload }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function generate() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/evolution-decisions", {
          method: "POST",
        });

        const result = (await response.json()) as EvolutionDecisionGenerateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "生成进化决策失败。" : (result.error ?? "生成进化决策失败。"));
        }

        setFeedback(`已生成 ${result.data.createdCount} 条进化决策。`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "生成进化决策失败。");
      }
    });
  }

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">Evolution Decisions</p>
            <h2 className="section-title">把复盘结果变成真正可采纳的系统更新建议</h2>
            <p className="section-desc">
              这里不是只看数据，而是把最近的复盘快照压缩成“画像 / 风格 / 方向 / 平台策略”四类可执行建议。采纳后会写进长期记忆层，其中 `STYLE` 会回写 style skill，`PROFILE` 会更新画像边界，`DIRECTION` 会生成新的方向条目。
            </p>
          </div>
          <button
            className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={generate}
            type="button"
          >
            {isPending ? "生成中..." : "生成进化决策"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
          {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        </div>

        {dashboard.decisions.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {dashboard.decisions.map((decision) => (
              <div className="subpanel px-4 py-4" key={decision.id}>
                <div className="flex flex-wrap gap-2">
                  <span className="pill">{decision.targetType}</span>
                  <span className="pill">{decision.status}</span>
                </div>
                <p className="mt-3 text-base font-semibold text-slate-800">{decision.headline}</p>
                <p className="muted mt-2 text-sm leading-7">{decision.rationale}</p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">建议动作</p>
                  <p className="muted mt-2 text-sm leading-7">{decision.suggestedAction}</p>
                </div>
                <div className="mt-4">
                  <EvolutionDecisionStatusActions decisionId={decision.id} currentStatus={decision.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted text-sm leading-7">当前还没有进化决策。先录入至少一条复盘快照，再生成第一批建议。</p>
        )}
      </div>
    </section>
  );
}
