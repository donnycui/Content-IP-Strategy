"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  ContentAssetPayload,
  ContentAssetUpdateResponse,
  StyleRevisionCreateResponse,
} from "@/lib/domain/contracts";

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

  function save(options?: {
    status?: ContentAssetPayload["status"];
    syncRevision?: boolean;
  }) {
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
            ...(options?.status ? { status: options.status } : {}),
          }),
        });

        const result = (await response.json()) as ContentAssetUpdateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "更新内容资产失败。" : (result.error ?? "更新内容资产失败。"));
        }

        const hasMeaningfulRevision = content.trim() !== asset.content.trim();

        if (options?.syncRevision && hasMeaningfulRevision) {
          const revisionResponse = await fetch("/api/style/revisions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              draftText: asset.content,
              revisedText: content,
              ruleDelta: `来自内容资产「${label}」的手改修订信号`,
            }),
          });

          const revisionResult = (await revisionResponse.json()) as StyleRevisionCreateResponse;

          if (!revisionResponse.ok || !revisionResult.ok) {
            throw new Error(
              revisionResult.ok ? "内容资产已保存，但写入风格修订信号失败。" : revisionResult.error ?? "写入风格修订信号失败。",
            );
          }
        }

        setFeedback(
          options?.syncRevision
            ? hasMeaningfulRevision
              ? "内容资产已保存，并同步为一条风格修订信号。"
              : "内容资产已保存；内容未发生变化，所以没有新增风格修订信号。"
            : options?.status === "READY"
              ? "已保存并标记为可交付。"
              : options?.status === "APPROVED"
                ? "已保存并标记为已确认。"
                : "内容资产已保存。",
        );
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
          onClick={() => save({ status: "READY" })}
          type="button"
        >
          标记可交付
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => save({ status: "APPROVED" })}
          type="button"
        >
          标记已确认
        </button>
        <button
          className="pill transition hover:border-sky-400 hover:text-slate-800"
          disabled={isPending}
          onClick={() => save({ syncRevision: true })}
          type="button"
        >
          保存并沉淀风格信号
        </button>
      </div>

      {feedback ? <p className="mt-3 text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
