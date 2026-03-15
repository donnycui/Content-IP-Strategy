"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ResearchCardRecord = {
  id: string;
  title: string;
  eventDefinition?: string | null;
  mainstreamNarrative?: string | null;
  ignoredVariables?: string | null;
  historicalAnalogy?: string | null;
  threeMonthProjection?: string | null;
  oneYearProjection?: string | null;
  winnersLosers?: string | null;
  positioningJudgment?: string | null;
};

const fields: Array<{ key: keyof ResearchCardRecord; label: string }> = [
  { key: "title", label: "标题" },
  { key: "eventDefinition", label: "事件定义" },
  { key: "mainstreamNarrative", label: "主流叙事" },
  { key: "ignoredVariables", label: "被忽略变量" },
  { key: "historicalAnalogy", label: "历史镜像" },
  { key: "threeMonthProjection", label: "三个月推演" },
  { key: "oneYearProjection", label: "一年推演" },
  { key: "winnersLosers", label: "赢家与输家" },
  { key: "positioningJudgment", label: "站位判断" },
];

export function ResearchCardEditor({ card }: { card: ResearchCardRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.key, card[field.key] ?? ""])) as Record<string, string>,
  );

  function updateField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save(status?: "DRAFT" | "READY") {
    startTransition(async () => {
      try {
        setFeedback("");
        const response = await fetch(`/api/research-cards/${card.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            status,
          }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "保存研究卡失败。");
        }

        setFeedback(status === "READY" ? "研究卡已保存，并标记为可发布。" : "研究卡已保存。");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "保存研究卡失败。");
      }
    });
  }

  return (
    <section className="space-y-5">
      {fields.map((field) => (
        <div className="panel px-6 py-5" key={field.key}>
          <label className="block space-y-3">
            <span className="text-sm font-semibold">{field.label}</span>
            {field.key === "title" ? (
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300"
                onChange={(event) => updateField(field.key, event.target.value)}
                value={form[field.key]}
              />
            ) : (
              <textarea
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-sky-300"
                onChange={(event) => updateField(field.key, event.target.value)}
                value={form[field.key]}
              />
            )}
          </label>
        </div>
      ))}
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
          保存并标记为可发布
        </button>
      </div>
      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}
    </section>
  );
}
