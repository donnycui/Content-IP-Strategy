"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DraftRecord = {
  id: string;
  platform: string;
  title: string | null;
  content: string;
  status?: string;
};

const labels: Record<string, string> = {
  WECHAT_ARTICLE: "公众号文章",
  WECHAT_VIDEO: "视频号口播",
  SHORT_POST: "短帖",
};

export function DraftEditorGrid({ drafts }: { drafts: DraftRecord[] }) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      {drafts.map((draft) => (
        <DraftEditor key={draft.id} draft={draft} />
      ))}
    </section>
  );
}

function DraftEditor({ draft }: { draft: DraftRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(draft.title ?? "");
  const [content, setContent] = useState(draft.content);
  const [feedback, setFeedback] = useState("");

  function save(status: "DRAFT" | "READY" = "DRAFT") {
    startTransition(async () => {
      try {
        setFeedback("");

        const response = await fetch(`/api/drafts/${draft.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            status,
          }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "保存草稿失败。");
        }

        setFeedback(status === "READY" ? "草稿已保存，并标记为可发布。" : "草稿已保存。");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "保存草稿失败。");
      }
    });
  }

  return (
    <div className="panel space-y-4 px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{labels[draft.platform] ?? draft.platform}</p>
        {draft.status ? <span className="pill">{draft.status}</span> : null}
      </div>
      <input
        className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
        onChange={(event) => setTitle(event.target.value)}
        placeholder="草稿标题"
        value={title}
      />
      <textarea
        className="min-h-80 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-sky-300"
        onChange={(event) => setContent(event.target.value)}
        value={content}
      />
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
          onClick={() => save("DRAFT")}
          type="button"
        >
          保存草稿
        </button>
        <button
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
          onClick={() => save("READY")}
          type="button"
        >
          标记为可发布
        </button>
      </div>
      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}
    </div>
  );
}
