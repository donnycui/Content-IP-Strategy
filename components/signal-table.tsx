"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { SignalRow } from "@/lib/mock-data";
import { ReviewActions } from "@/components/review-actions";

const filterLabels = {
  ALL: "全部",
  NEW: "新信号",
  REVIEWED: "已复核",
  CANDIDATE: "候选",
  DEFERRED: "延后",
} as const;

const priorityLabels = {
  PRIORITIZE: "优先推进",
  WATCH: "持续观察",
  DEPRIORITIZE: "降低优先级",
} as const;

const statusLabels: Record<string, string> = {
  NEW: "新信号",
  REVIEWED: "已复核",
  CANDIDATE: "候选",
  DEFERRED: "延后",
  IGNORED: "已忽略",
  ARCHIVED: "已归档",
};

export function SignalTable({ signals }: { signals: SignalRow[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"ALL" | "NEW" | "REVIEWED" | "CANDIDATE" | "DEFERRED">("NEW");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [sortMode, setSortMode] = useState<"RECENT" | "IMPORTANCE" | "VIEWPOINT">("IMPORTANCE");
  const [highScoreOnly, setHighScoreOnly] = useState(true);
  const [bulkFeedback, setBulkFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const summary = {
      ALL: signals.length,
      NEW: 0,
      REVIEWED: 0,
      CANDIDATE: 0,
      DEFERRED: 0,
    };

    for (const signal of signals) {
      if (signal.status === "NEW") summary.NEW += 1;
      if (signal.status === "REVIEWED") summary.REVIEWED += 1;
      if (signal.status === "CANDIDATE") summary.CANDIDATE += 1;
      if (signal.status === "DEFERRED") summary.DEFERRED += 1;
    }

    return summary;
  }, [signals]);

  const visibleSignals = useMemo(() => {
    let nextSignals = filter === "ALL" ? [...signals] : signals.filter((signal) => signal.status === filter);

    if (sourceFilter !== "ALL") {
      nextSignals = nextSignals.filter((signal) => signal.source === sourceFilter);
    }

    if (highScoreOnly) {
      nextSignals = nextSignals.filter(
        (signal) =>
          signal.priorityRecommendation === "PRIORITIZE" ||
          signal.importanceScore >= 4 ||
          signal.viewpointScore >= 4,
      );
    }

    nextSignals.sort((left, right) => {
      const priorityRank = {
        PRIORITIZE: 3,
        WATCH: 2,
        DEPRIORITIZE: 1,
      } as const;

      if (priorityRank[right.priorityRecommendation] !== priorityRank[left.priorityRecommendation]) {
        return priorityRank[right.priorityRecommendation] - priorityRank[left.priorityRecommendation];
      }

      if (sortMode === "IMPORTANCE") {
        return right.importanceScore - left.importanceScore;
      }

      if (sortMode === "VIEWPOINT") {
        return right.viewpointScore - left.viewpointScore;
      }

      return String(right.publishedAt).localeCompare(String(left.publishedAt));
    });

    return nextSignals;
  }, [filter, highScoreOnly, signals, sortMode, sourceFilter]);

  const availableSources = useMemo(() => {
    return ["ALL", ...new Set(signals.map((signal) => signal.source))];
  }, [signals]);

  const allVisibleSelected =
    visibleSignals.length > 0 && visibleSignals.every((signal) => selectedIds.includes(signal.id));

  function toggleSelected(signalId: string) {
    setSelectedIds((current) =>
      current.includes(signalId) ? current.filter((id) => id !== signalId) : [...current, signalId],
    );
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleSignals.some((signal) => signal.id === id));
      }

      return [...new Set([...current, ...visibleSignals.map((signal) => signal.id)])];
    });
  }

  function runBulkAction(reviewStatus: "KEPT" | "DEFERRED" | "REJECTED", reasoningAcceptance: "ACCEPTED" | "PARTIAL" | "REJECTED") {
    startTransition(async () => {
      try {
        setBulkFeedback("");

        const response = await fetch("/api/reviews/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signalIds: selectedIds,
            reviewStatus,
            reasoningAcceptance,
          }),
        });

        const result = (await response.json()) as {
          ok: boolean;
          error?: string;
          signalsUpdated?: number;
          status?: string;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "批量处理失败。");
        }

        setBulkFeedback(`已更新 ${result.signalsUpdated ?? 0} 条信号，状态变更为 ${statusLabels[result.status ?? ""] ?? result.status ?? "-" }。`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        setBulkFeedback(error instanceof Error ? error.message : "批量处理失败。");
      }
    });
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["ALL", "NEW", "REVIEWED", "CANDIDATE", "DEFERRED"] as const).map((key) => (
              <button
                className={`pill transition ${filter === key ? "border-sky-300 text-white" : "hover:border-white/30 hover:text-white"}`}
                key={key}
                onClick={() => setFilter(key)}
                type="button"
              >
                {filterLabels[key]} {counts[key]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="pill bg-transparent"
              onChange={(event) => setSourceFilter(event.target.value)}
              value={sourceFilter}
            >
              {availableSources.map((source) => (
                <option key={source} value={source}>
                  {source === "ALL" ? "全部来源" : source}
                </option>
              ))}
            </select>
            <select
              className="pill bg-transparent"
              onChange={(event) => setSortMode(event.target.value as "RECENT" | "IMPORTANCE" | "VIEWPOINT")}
              value={sortMode}
            >
              <option value="IMPORTANCE">排序：重要性</option>
              <option value="VIEWPOINT">排序：观点潜力</option>
              <option value="RECENT">排序：最近时间</option>
            </select>
            <button
              className={`pill transition ${highScoreOnly ? "border-sky-300 text-white" : "hover:border-white/30 hover:text-white"}`}
              onClick={() => setHighScoreOnly((current) => !current)}
              type="button"
            >
              {highScoreOnly ? "仅看高分" : "显示全部"}
            </button>
            <button
              className="pill transition hover:border-sky-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !selectedIds.length}
              onClick={() => runBulkAction("KEPT", "ACCEPTED")}
              type="button"
            >
              批量保留
            </button>
            <button
              className="pill transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !selectedIds.length}
              onClick={() => runBulkAction("DEFERRED", "PARTIAL")}
              type="button"
            >
              批量延后
            </button>
            <button
              className="pill transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !selectedIds.length}
              onClick={() => runBulkAction("REJECTED", "REJECTED")}
              type="button"
            >
              批量忽略
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="muted">
            当前显示 {visibleSignals.length} / {signals.length} 条信号
          </span>
          {bulkFeedback ? <span className="text-emerald-300">{bulkFeedback}</span> : null}
        </div>
      </div>
      <div className="grid grid-cols-[0.4fr,2.6fr,1.25fr,1.1fr,1fr,1.1fr] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.22em] text-slate-400">
        <button className="text-left" onClick={toggleAllVisible} type="button">
          {allVisibleSelected ? "清空" : "全选"}
        </button>
        <span>信号</span>
        <span>上下文</span>
        <span>优先级与分数</span>
        <span>复核</span>
        <span>状态</span>
      </div>
      <div>
        {visibleSignals.map((signal) => (
          <div
            className="grid grid-cols-[0.4fr,2.6fr,1.25fr,1.1fr,1fr,1.1fr] gap-4 border-b border-white/5 px-5 py-4 transition hover:bg-white/5"
            key={signal.id}
          >
            <label className="flex items-start pt-1">
              <input
                checked={selectedIds.includes(signal.id)}
                className="h-4 w-4 rounded border-white/20 bg-black/20"
                onChange={() => toggleSelected(signal.id)}
                type="checkbox"
              />
            </label>
            <Link className="space-y-2" href={`/signals/${signal.id}`}>
              <p className="text-sm font-medium leading-6">{signal.title}</p>
              <p className="muted text-sm">{signal.reasoningSummary}</p>
              <div className="flex flex-wrap gap-2">
                {signal.topicTags.map((tag) => (
                  <span className="pill" key={tag}>
                    {tag}
                  </span>
                ))}
                <span className="pill">{signal.primaryObservationCluster}</span>
                {signal.secondaryObservationCluster ? <span className="pill">{signal.secondaryObservationCluster}</span> : null}
              </div>
            </Link>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="text-slate-200">{signal.source}</p>
              <p>{signal.publishedAt}</p>
              <p>{signal.motherTheme}</p>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <span
                className={`pill ${
                  signal.priorityRecommendation === "PRIORITIZE"
                    ? "border-emerald-300/50 text-emerald-200"
                    : signal.priorityRecommendation === "DEPRIORITIZE"
                      ? "border-amber-300/40 text-amber-200"
                      : ""
                }`}
              >
                {priorityLabels[signal.priorityRecommendation]}
              </span>
              <p className="muted">共识 {signal.consensusStrength.toFixed(1)}</p>
              <p className="muted">日常噪音 {signal.companyRoutineScore.toFixed(1)}</p>
            </div>
            <ReviewActions compact signalId={signal.id} />
            <div className="flex items-start">
              <span className="pill">{statusLabels[signal.status] ?? signal.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
