"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TopicDirectionDashboardPayload, TopicDirectionDashboardResponse } from "@/lib/domain/contracts";
import { getApiPath } from "@/lib/client-backend";

const topicStatusLabels = {
  ACTIVE: "活跃主题线",
  WATCHING: "观察主题线",
  ARCHIVED: "已归档",
} as const;

const priorityLabels = {
  PRIMARY: "优先推进",
  SECONDARY: "重点跟进",
  WATCH: "继续观察",
} as const;

const formatLabels = {
  SINGLE_POST: "单条快判断",
  RECURRING_TRACK: "连续主题跟踪",
  SERIES_ENTRY: "专题系列入口",
} as const;

export function TopicDirectionWorkspaceClient() {
  const [dashboard, setDashboard] = useState<TopicDirectionDashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(getApiPath("/topic-direction/dashboard"));
        const result = (await response.json()) as TopicDirectionDashboardResponse;

        if (!response.ok || !result.ok || !result.data?.dashboard) {
          throw new Error(result.ok ? "读取方向与选题失败。" : (result.error ?? "读取方向与选题失败。"));
        }

        if (!cancelled) {
          setDashboard(result.data.dashboard);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "读取方向与选题失败。");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="panel px-6 py-6">
        <p className="text-sm text-rose-600">{error}</p>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="panel px-6 py-6">
        <p className="muted text-sm leading-7">正在加载方向、主题线和今日选题...</p>
      </section>
    );
  }

  const groupedTopics = dashboard.topics.reduce<Record<string, typeof dashboard.topics>>((accumulator, topic) => {
    const key = topic.directionTitle ?? "未归入方向";
    accumulator[key] = accumulator[key] ? [...accumulator[key], topic] : [topic];
    return accumulator;
  }, {});

  const groupedCandidates = dashboard.topicCandidates.reduce<Record<string, typeof dashboard.topicCandidates>>((accumulator, candidate) => {
    const key = candidate.directionTitle ?? "未归入方向";
    accumulator[key] = accumulator[key] ? [...accumulator[key], candidate] : [candidate];
    return accumulator;
  }, {});

  return (
    <section className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="metric-label">当前画像锚点</p>
            <p className="text-lg font-semibold">{dashboard.profile.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/agents/creator-profile">
              查看创作者画像
            </Link>
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/agents/style-content">
              推进内容层
            </Link>
          </div>
        </div>
        <p className="muted mt-3 text-sm leading-7">{dashboard.profile.positioning}</p>
      </section>

      <section className="space-y-5">
        {Object.entries(groupedTopics).map(([directionTitle, topics]) => (
          <div className="panel space-y-5 px-6 py-5" key={directionTitle}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="metric-label">关联方向</p>
                <h3 className="text-2xl font-semibold leading-8">{directionTitle}</h3>
              </div>
              <span className="pill">{topics.length} 条主题线</span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {topics.map((topic) => (
                <div className="subpanel space-y-4 px-5 py-5" key={topic.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="pill">{topicStatusLabels[topic.status]}</span>
                      <span className="pill">热度 {topic.heatScore.toFixed(1)}</span>
                      <span className="pill">{topic.signalCount} 条支撑信号</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold leading-7">{topic.title}</h4>
                    <p className="muted text-sm leading-7">{topic.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        {Object.entries(groupedCandidates).map(([directionTitle, candidates]) => (
          <div className="panel space-y-5 px-6 py-5" key={directionTitle}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="metric-label">关联方向</p>
                <h3 className="text-2xl font-semibold">{directionTitle}</h3>
              </div>
              <span className="pill">{candidates.length} 条选题建议</span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {candidates.map((candidate) => (
                <div className="subpanel space-y-4 px-5 py-5" key={candidate.id}>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill">{priorityLabels[candidate.priority]}</span>
                    <span className="pill">{formatLabels[candidate.formatRecommendation]}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold leading-7">{candidate.title}</h4>
                    <p className="muted text-sm leading-7">{candidate.topicSummary}</p>
                  </div>
                  <div className="subpanel px-4 py-4">
                    <p className="text-sm font-semibold text-slate-700">为什么现在值得讲</p>
                    <p className="muted mt-2 text-sm leading-7">{candidate.whyNow}</p>
                  </div>
                  <div className="subpanel px-4 py-4">
                    <p className="text-sm font-semibold text-slate-700">为什么适合你来讲</p>
                    <p className="muted mt-2 text-sm leading-7">{candidate.fitReason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}
