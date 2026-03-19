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
  const [allowedTier, setAllowedTier] = useState<"FAST" | "BALANCED" | "DEEP">(props.allowedTiers?.[0] ?? "BALANCED");
  const [accessMode, setAccessMode] = useState<"STANDARD" | "MANUAL" | "DEEP_REASONING">(
    props.canSelectModel ? "MANUAL" : props.canUsePremiumReasoning ? "DEEP_REASONING" : "STANDARD",
  );
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

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
            allowedTiers: [accessMode === "DEEP_REASONING" ? "DEEP" : allowedTier],
            canSelectModel: accessMode === "MANUAL",
            canUsePremiumReasoning: accessMode === "DEEP_REASONING",
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
            <option value="">全局模式</option>
            {capabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">模型档位</p>
          <select
            className="field"
            disabled={accessMode === "DEEP_REASONING"}
            onChange={(event) => setAllowedTier(event.target.value as "FAST" | "BALANCED" | "DEEP")}
            value={accessMode === "DEEP_REASONING" ? "DEEP" : allowedTier}
          >
            {tierOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">权限模式</p>
          <select
            className="field"
            onChange={(event) => setAccessMode(event.target.value as "STANDARD" | "MANUAL" | "DEEP_REASONING")}
            value={accessMode}
          >
            <option value="STANDARD">固定模型</option>
            <option value="MANUAL">允许用户手动选模型</option>
            <option value="DEEP_REASONING">启用深度推理</option>
          </select>
        </div>
      </div>

      <p className="muted text-sm leading-6">
        保存同一个“套餐档位 + 能力范围”时，会直接覆盖旧配置。当前页面只保留一个配置入口，下面的内容只用于展示现有规则。
      </p>

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
