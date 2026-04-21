import { NextResponse } from "next/server";
import type { ModelCapabilityValue, ModelTierAccessResponse } from "@/lib/domain/contracts";
import { MODEL_CAPABILITY_KEYS, getCapabilityTierAccess } from "@/lib/services/model-routing-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

function isCapabilityKey(value: string): value is ModelCapabilityValue {
  return (MODEL_CAPABILITY_KEYS as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const capabilityKey = url.searchParams.get("capabilityKey")?.trim() ?? "";

  if (!isCapabilityKey(capabilityKey)) {
    return NextResponse.json<ModelTierAccessResponse>(
      {
        ok: false,
        error: "无效的能力标识。",
      },
      { status: 400 },
    );
  }

  try {
    const access = await getCapabilityTierAccess(capabilityKey);

    return NextResponse.json<ModelTierAccessResponse>({
      ok: true,
      data: {
        capabilityKey,
        planKey: access.planKey,
        allowedTiers: access.allowedTiers,
        canUsePremiumReasoning: access.canUsePremiumReasoning,
      },
    });
  } catch (error) {
    return NextResponse.json<ModelTierAccessResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取档位权限失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
