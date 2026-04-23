"use client";

import { useEffect, useMemo, useState } from "react";
import type { ModelCapabilityValue, ModelTierAccessResponse, ModelTierValue } from "@/lib/domain/contracts";
import { getApiPath } from "@/lib/client-backend";

const tierOptions: Array<{
  value: ModelTierValue;
  label: string;
  description: string;
}> = [
  { value: "FAST", label: "快速", description: "更快，适合探索和初步判断" },
  { value: "BALANCED", label: "平衡", description: "质量与速度均衡，适合日常工作" },
  { value: "DEEP", label: "深度", description: "推理更强，适合战略判断和高质量输出" },
];

export function ModelTierPicker(props: {
  value: ModelTierValue;
  onChange: (value: ModelTierValue) => void;
  capabilityKey: ModelCapabilityValue;
  compact?: boolean;
}) {
  const [allowedTiers, setAllowedTiers] = useState<ModelTierValue[] | null>(null);
  const [planLabel, setPlanLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTierAccess() {
      try {
        const response = await fetch(`${getApiPath("/model-tier-access")}?capabilityKey=${props.capabilityKey}`);
        const result = (await response.json()) as ModelTierAccessResponse;

        if (!response.ok || !result.ok || !result.data) {
          return;
        }

        if (cancelled) {
          return;
        }

        setAllowedTiers(result.data.allowedTiers);
        setPlanLabel(result.data.planKey);
      } catch {
        // keep local fallback options
      }
    }

    void loadTierAccess();

    return () => {
      cancelled = true;
    };
  }, [props.capabilityKey]);

  const visibleOptions = useMemo(() => {
    if (!allowedTiers?.length) {
      return tierOptions;
    }

    return tierOptions.filter((option) => allowedTiers.includes(option.value));
  }, [allowedTiers]);

  useEffect(() => {
    if (!visibleOptions.some((option) => option.value === props.value)) {
      props.onChange(visibleOptions[0]?.value ?? "BALANCED");
    }
  }, [props, visibleOptions]);

  return (
    <label className="flex flex-col gap-2">
      {!props.compact ? <span className="text-sm font-medium text-slate-700">生成档位</span> : null}
      <select
        className={props.compact ? "field min-w-[120px]" : "field"}
        onChange={(event) => props.onChange(event.target.value as ModelTierValue)}
        value={props.value}
      >
        {visibleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} · {option.description}
          </option>
        ))}
      </select>
      {!props.compact && planLabel ? (
        <span className="muted text-xs leading-6">当前按 {planLabel} 套餐显示这个能力可用的档位。</span>
      ) : null}
    </label>
  );
}
