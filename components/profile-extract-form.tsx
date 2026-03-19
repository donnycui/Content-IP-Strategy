"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ModelTierValue, ProfileExtractResponse } from "@/lib/domain/contracts";
import { ModelTierPicker } from "@/components/model-tier-picker";

export function ProfileExtractForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sourceText, setSourceText] = useState("");
  const [requestedTier, setRequestedTier] = useState<ModelTierValue>("DEEP");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/profile/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceText,
            requestedTier,
          }),
        });

        const result = (await response.json()) as ProfileExtractResponse;

        if (!response.ok || !result.ok || !result.data?.profileId) {
          throw new Error(result.ok ? "IP 提炼失败。" : (result.error ?? "IP 提炼失败。"));
        }

        setFeedback("IP 提炼完成，已生成第一版创作者画像。");
        setSourceText("");
        router.push(`/profile?id=${result.data.profileId}`);
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "IP 提炼失败。");
      }
    });
  }

  return (
    <section className="panel px-6 py-5">
      <p className="section-kicker">IP 提炼</p>
      <h2 className="section-title mt-2">先让系统知道你是谁，再决定你该讲什么</h2>
      <p className="section-desc mt-3">
        输入你当前的方向、擅长内容、目标受众、风格偏好和增长目标。系统会先生成一份创作者画像草案，后续方向台和选题台都将围绕它工作。
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">创作者自述</span>
          <textarea
            className="min-h-56 rounded-3xl border px-4 py-4 text-sm leading-7 outline-none transition"
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="例如：我希望做一个聚焦商业、金融、科技交叉视角的知识型创作者，面向高认知受众，提供方向判断、结构性理解和行动建议。我的风格希望是冷静、锋利、宏观叙事型，但最终要落到可执行的站位判断。"
            required
            value={sourceText}
          />
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <ModelTierPicker onChange={setRequestedTier} value={requestedTier} />
          <button
            className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-5 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "提炼中..." : "开始提炼 IP"}
          </button>
          {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
          {error ? <span className="text-sm text-rose-600">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}
