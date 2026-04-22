"use client";

import { useState } from "react";
import type { ModelTierValue } from "@/lib/domain/contracts";
import { ModelTierPicker } from "@/components/model-tier-picker";
import { DirectionGenerateButton } from "@/components/direction-generate-button";
import { TopicGenerateButton } from "@/components/topic-generate-button";
import { TopicCandidateGenerateButton } from "@/components/topic-candidate-generate-button";

export function TopicDirectionActions() {
  const [requestedTier, setRequestedTier] = useState<ModelTierValue>("BALANCED");

  return (
    <div className="space-y-4">
      <div className="subpanel px-4 py-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">模型档位</p>
          <p className="muted text-sm leading-7">这里控制“方向建议、主题线、选题建议”这三类生成动作使用的模型档位。</p>
        </div>
        <div className="mt-4">
          <ModelTierPicker capabilityKey="direction_generation" onChange={setRequestedTier} value={requestedTier} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <DirectionGenerateButton requestedTier={requestedTier} />
        <TopicGenerateButton requestedTier={requestedTier} />
        <TopicCandidateGenerateButton requestedTier={requestedTier} />
      </div>
    </div>
  );
}
