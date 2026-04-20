"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ContentProjectPayload, ContentProjectUpdateResponse } from "@/lib/domain/contracts";

export function ContentProjectEditor({ project }: { project: ContentProjectPayload }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(project.title);
  const [summary, setSummary] = useState(project.summary ?? "");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function save(status?: ContentProjectPayload["status"]) {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/content/projects/${project.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            summary,
            ...(status ? { status } : {}),
          }),
        });

        const result = (await response.json()) as ContentProjectUpdateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "更新内容项目失败。" : (result.error ?? "更新内容项目失败。"));
        }

        setFeedback(status === "READY" ? "项目已保存并标记为可交付。" : "项目元数据已保存。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "更新内容项目失败。");
      }
    });
  }

  return (
    <section className="subpanel px-4 py-4">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">项目元数据</p>

        <input
          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="项目标题"
          value={title}
        />

        <textarea
          className="min-h-28 w-full rounded-2xl border px-4 py-3 text-sm leading-7 outline-none transition"
          onChange={(event) => setSummary(event.target.value)}
          placeholder="项目摘要"
          value={summary}
        />

        <div className="flex flex-wrap gap-2">
          <button
            className="pill transition hover:border-sky-400 hover:text-slate-800"
            disabled={isPending}
            onClick={() => save()}
            type="button"
          >
            保存项目
          </button>
          <button
            className="pill transition hover:border-sky-400 hover:text-slate-800"
            disabled={isPending}
            onClick={() => save("READY")}
            type="button"
          >
            标记项目可交付
          </button>
        </div>

        {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </section>
  );
}
