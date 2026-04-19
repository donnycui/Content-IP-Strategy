"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { ReviewDashboardPayload, ReviewSnapshotCreateResponse } from "@/lib/domain/contracts";

export function ReviewMetricsForm({ dashboard }: { dashboard: ReviewDashboardPayload }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredProjectId = searchParams.get("projectId") ?? dashboard.projects[0]?.project.id ?? "";
  const preferredAssetId = searchParams.get("assetId") ?? dashboard.projects[0]?.assets[0]?.id ?? "";
  const preferredChannelKey = searchParams.get("channelKey") ?? dashboard.projects[0]?.publishRecords[0]?.channelKey ?? "xiaohongshu";
  const [isPending, startTransition] = useTransition();
  const [projectId, setProjectId] = useState(preferredProjectId);
  const [assetId, setAssetId] = useState(preferredAssetId);
  const [channelKey, setChannelKey] = useState(preferredChannelKey);
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [saves, setSaves] = useState("");
  const [inquiries, setInquiries] = useState("");
  const [leads, setLeads] = useState("");
  const [conversions, setConversions] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function toNumber(value: string) {
    return value.trim() ? Number(value) : null;
  }

  const selectedProject = dashboard.projects.find((item) => item.project.id === projectId) ?? null;
  const selectedAsset = selectedProject?.assets.find((asset) => asset.id === assetId) ?? selectedProject?.assets[0] ?? null;

  function handleProjectChange(nextProjectId: string) {
    setProjectId(nextProjectId);
    const nextProject = dashboard.projects.find((item) => item.project.id === nextProjectId);
    const nextAsset = nextProject?.assets[0] ?? null;
    const nextChannel = nextProject?.publishRecords[0]?.channelKey ?? channelKey;

    setAssetId(nextAsset?.id ?? "");
    setChannelKey(nextChannel);
  }

  function submit() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/review-snapshots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            assetId: assetId || null,
            channelKey,
            views: toNumber(views),
            likes: toNumber(likes),
            comments: toNumber(comments),
            shares: toNumber(shares),
            saves: toNumber(saves),
            inquiries: toNumber(inquiries),
            leads: toNumber(leads),
            conversions: toNumber(conversions),
            reviewNote,
          }),
        });

        const result = (await response.json()) as ReviewSnapshotCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "新增复盘记录失败。" : (result.error ?? "新增复盘记录失败。"));
        }

        setFeedback("已记录一条复盘快照。");
        setViews("");
        setLikes("");
        setComments("");
        setShares("");
        setSaves("");
        setInquiries("");
        setLeads("");
        setConversions("");
        setReviewNote("");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "新增复盘记录失败。");
      }
    });
  }

  return (
    <section className="subpanel px-4 py-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">录入复盘数据</p>
          <p className="muted text-sm leading-7">第一版先手动回填数据，不等平台 API。重点是让系统开始积累“内容表现到进化建议”的真实闭环。</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <select
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
            onChange={(event) => handleProjectChange(event.target.value)}
            value={projectId}
          >
            {dashboard.projects.length ? (
              dashboard.projects.map((item) => (
                <option key={item.project.id} value={item.project.id}>
                  {item.project.title}
                </option>
              ))
            ) : (
              <option value="">暂无内容项目</option>
            )}
          </select>

          <select
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
            onChange={(event) => setAssetId(event.target.value)}
            value={assetId}
          >
            {selectedProject?.assets.length ? (
              selectedProject.assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title || asset.assetType}
                </option>
              ))
            ) : (
              <option value="">暂无内容资产</option>
            )}
          </select>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <input
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
            onChange={(event) => setChannelKey(event.target.value)}
            placeholder="channel key，例如 xiaohongshu"
            value={channelKey}
          />
          <div className="rounded-2xl border px-4 py-3 text-sm leading-7 text-slate-700">
            {selectedAsset ? `当前复盘资产：${selectedAsset.title || selectedAsset.assetType}` : "当前项目还没有可选内容资产。"}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setViews(e.target.value)} placeholder="浏览" value={views} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setLikes(e.target.value)} placeholder="点赞" value={likes} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setComments(e.target.value)} placeholder="评论" value={comments} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setShares(e.target.value)} placeholder="转发" value={shares} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setSaves(e.target.value)} placeholder="收藏" value={saves} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setInquiries(e.target.value)} placeholder="咨询" value={inquiries} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setLeads(e.target.value)} placeholder="线索" value={leads} />
          <input className="rounded-2xl border px-4 py-3 text-sm outline-none transition" onChange={(e) => setConversions(e.target.value)} placeholder="转化" value={conversions} />
        </div>

        <textarea
          className="min-h-28 w-full rounded-2xl border px-4 py-3 text-sm leading-7 outline-none transition"
          onChange={(event) => setReviewNote(event.target.value)}
          placeholder="补充你的主观复盘，例如：这个题目有流量但不像我，评论区问题很集中，直播间节奏不对。"
          value={reviewNote}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || !projectId}
            onClick={submit}
            type="button"
          >
            {isPending ? "记录中..." : "记录复盘快照"}
          </button>
          {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
          {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        </div>
      </div>
    </section>
  );
}
