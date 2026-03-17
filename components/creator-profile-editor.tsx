"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CreatorProfileRow } from "@/lib/profile-data";

export function CreatorProfileEditor({ profile }: { profile: CreatorProfileRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: profile.name,
    positioning: profile.positioning,
    persona: profile.persona,
    audience: profile.audience,
    coreThemes: profile.coreThemes,
    voiceStyle: profile.voiceStyle,
    growthGoal: profile.growthGoal,
    contentBoundaries: profile.contentBoundaries,
    currentStage: profile.currentStage,
  });

  function updateField<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: profile.id,
            ...form,
          }),
        });

        const result = (await response.json()) as { ok: boolean; error?: string };

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "保存创作者画像失败。");
        }

        setFeedback("创作者画像已更新。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "保存创作者画像失败。");
      }
    });
  }

  return (
    <section className="panel px-6 py-5">
      <div className="space-y-2">
        <p className="section-kicker">Creator Profile</p>
        <h2 className="section-title mt-2">把定位、人设和增长目标固定下来</h2>
        <p className="section-desc mt-3">
          这张画像会成为方向台、主题台和后续画像进化建议的基础锚点。系统可以提出变化建议，但不会自动改掉它。
        </p>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">名称</span>
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">当前阶段</span>
          <select value={form.currentStage} onChange={(event) => updateField("currentStage", event.target.value as typeof form.currentStage)}>
            <option value="EXPLORING">探索期</option>
            <option value="EMERGING">成长期</option>
            <option value="SCALING">放大期</option>
            <option value="ESTABLISHED">成熟期</option>
          </select>
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">定位</span>
          <textarea className="min-h-24" value={form.positioning} onChange={(event) => updateField("positioning", event.target.value)} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">人设</span>
          <textarea className="min-h-24" value={form.persona} onChange={(event) => updateField("persona", event.target.value)} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">受众</span>
          <textarea className="min-h-24" value={form.audience} onChange={(event) => updateField("audience", event.target.value)} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">核心议题</span>
          <textarea className="min-h-24" value={form.coreThemes} onChange={(event) => updateField("coreThemes", event.target.value)} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">表达风格</span>
          <textarea className="min-h-24" value={form.voiceStyle} onChange={(event) => updateField("voiceStyle", event.target.value)} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">增长目标</span>
          <textarea className="min-h-24" value={form.growthGoal} onChange={(event) => updateField("growthGoal", event.target.value)} />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">内容边界</span>
          <textarea className="min-h-24" value={form.contentBoundaries} onChange={(event) => updateField("contentBoundaries", event.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
          <button
            className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-5 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "保存中..." : "保存创作者画像"}
          </button>
          {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
          {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}

