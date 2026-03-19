"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  CapabilityKeyValue,
  PlanKeyValue,
  PlanModelAccessUpsertResponse,
} from "@/lib/domain/contracts";

const planOptions: Array<{ value: PlanKeyValue; label: string }> = [
  { value: "STANDARD", label: "标准版" },
  { value: "PROFESSIONAL", label: "专业版" },
  { value: "FLAGSHIP", label: "旗舰版" },
];

const capabilityOptions: Array<{ value: CapabilityKeyValue; label: string }> = [
  { value: "signal_scoring", label: "信号初筛" },
  { value: "ip_extraction_interview", label: "IP 提炼访谈" },
  { value: "ip_strategy_report", label: "IP 战略报告" },
  { value: "direction_generation", label: "方向生成" },
  { value: "topic_generation", label: "主题生成" },
  { value: "topic_candidate_generation", label: "选题推荐" },
  { value: "profile_evolution", label: "画像进化建议" },
  { value: "draft_generation", label: "草稿生成" },
];

const tierOptions = [
  { value: "FAST", label: "快速" },
  { value: "BALANCED", label: "平衡" },
  { value: "DEEP", label: "深度" },
] as const;

export function AdminPlanAccessForm(props: {
  planKey?: PlanKeyValue;
  capabilityKey?: CapabilityKeyValue | null;
  allowedTiers?: Array<"FAST" | "BALANCED" | "DEEP">;
  canSelectModel?: boolean;
  canUsePremiumReasoning?: boolean;
  title?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [planKey, setPlanKey] = useState<PlanKeyValue>(props.planKey ?? "STANDARD");
  const [capabilityKey, setCapabilityKey] = useState<CapabilityKeyValue | "">(props.capabilityKey ?? "");
  const [allowedTiers, setAllowedTiers] = useState<Array<"FAST" | "BALANCED" | "DEEP">>(props.allowedTiers ?? ["BALANCED"]);
  const [canSelectModel, setCanSelectModel] = useState(props.canSelectModel ?? false);
  const [canUsePremiumReasoning, setCanUsePremiumReasoning] = useState(props.canUsePremiumReasoning ?? false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function toggleTier(tier: "FAST" | "BALANCED" | "DEEP") {
    setAllowedTiers((current) =>
      current.includes(tier) ? current.filter((item) => item !== tier) : [...current, tier],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch("/api/admin/plans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planKey,
            capabilityKey: capabilityKey || null,
            allowedTiers,
            canSelectModel,
            canUsePremiumReasoning,
          }),
        });

        const result = (await response.json()) as PlanModelAccessUpsertResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "保存套餐权限失败。" : (result.error ?? "保存套餐权限失败。"));
        }

        setFeedback("已保存。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "保存套餐权限失败。");
      }
    });
  }

  return (
    <form className="subpanel space-y-4 px-5 py-5" onSubmit={handleSubmit}>
      {props.title ? <h3 className="text-lg font-semibold">{props.title}</h3> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">套餐档位</p>
          <select className="field" onChange={(event) => setPlanKey(event.target.value as PlanKeyValue)} value={planKey}>
            {planOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">能力范围</p>
          <select className="field" onChange={(event) => setCapabilityKey(event.target.value as CapabilityKeyValue | "")} value={capabilityKey}>
            <option value="">全局默认</option>
            {capabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">允许使用的模型档位</p>
        <div className="flex flex-wrap gap-3">
          {tierOptions.map((option) => (
            <label className="flex items-center gap-2 text-sm text-slate-700" key={option.value}>
              <input
                checked={allowedTiers.includes(option.value)}
                onChange={() => toggleTier(option.value)}
                type="checkbox"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input checked={canSelectModel} onChange={(event) => setCanSelectModel(event.target.checked)} type="checkbox" />
          允许用户手动选择模型
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            checked={canUsePremiumReasoning}
            onChange={(event) => setCanUsePremiumReasoning(event.target.checked)}
            type="checkbox"
          />
          允许使用高推理深度
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="pill" disabled={isPending} type="submit">
          {isPending ? "保存中..." : "保存套餐权限"}
        </button>
        {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>
    </form>
  );
}
