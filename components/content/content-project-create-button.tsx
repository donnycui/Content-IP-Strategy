"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ContentProjectCreateResponse, TopicCandidateRow } from "@/lib/domain/contracts";

export function ContentProjectCreateButton({ candidate }: { candidate: TopicCandidateRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function createProject() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/content/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topicCandidateId: candidate.id,
          }),
        });

        const result = (await response.json()) as ContentProjectCreateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "创建内容项目失败。" : (result.error ?? "创建内容项目失败。"));
        }

        setFeedback(`已从「${candidate.title}」创建内容项目。`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "创建内容项目失败。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-2.5 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={createProject}
        type="button"
      >
        {isPending ? "创建中..." : "创建内容项目"}
      </button>
      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
