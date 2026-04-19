"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ContentAssetPayload, ContentAssetUpdateResponse } from "@/lib/domain/contracts";

export function ContentAssetEditor({
  asset,
  label,
}: {
  asset: ContentAssetPayload;
  label: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(asset.title ?? "");
  const [content, setContent] = useState(asset.content);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function save(status?: ContentAssetPayload["status"]) {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/content/assets/${asset.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            ...(status ? { status } : {}),
          }),
        });

        const result = (await response.json()) as ContentAssetUpdateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "更新内容资产失败。" : (result.error ?? "更新内容资产失败。"));
        }

        setFeedback(status === "READY" ? "已保存并标记为可交付。" : status === "APPROVED" ? "已保存并标记为已确认。" : "内容资产已保存。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "更新内容资产失败。");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill">{label}</span>
        <span className="pill">{asset.status}</span>
      </div>

      <input
        className="mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
        onChange={(event) => setTitle(event.target.value)}
        placeholder={`${label} 标题`}
        value={title}
      />

      <textarea
        className="mt-3 min-h-48 w-full rounded-2xl border px-4 py-3 text-sm leading-7 outline-none transition"
        onChange={(event) => setContent(event.target.value)}
        value={content}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => save()}
          type="button"
        >
          保存
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => save("READY")}
          type="button"
        >
          标记可交付
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => save("APPROVED")}
          type="button"
        >
          标记已确认
        </button>
      </div>

      {feedback ? <p className="mt-3 text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
