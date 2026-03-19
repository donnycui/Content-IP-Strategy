"use client";

import type { ModelTierValue } from "@/lib/domain/contracts";

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
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      {!props.compact ? <span className="text-sm font-medium text-slate-700">生成档位</span> : null}
      <select
        className={props.compact ? "field min-w-[120px]" : "field"}
        onChange={(event) => props.onChange(event.target.value as ModelTierValue)}
        value={props.value}
      >
        {tierOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} · {option.description}
          </option>
        ))}
      </select>
    </label>
  );
}
