"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  ManagedModelDeleteResponse,
  ManagedModelUpdateResponse,
  ModelTierValue,
} from "@/lib/domain/contracts";

const tierOptions: Array<{ value: ModelTierValue; label: string }> = [
  { value: "FAST", label: "快速" },
  { value: "BALANCED", label: "平衡" },
  { value: "DEEP", label: "深度" },
];

export function AdminModelUpdateForm(props: {
  id: string;
  tier: ModelTierValue;
  enabled: boolean;
  visibleToUsers: boolean;
  routeUsageCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tier, setTier] = useState<ModelTierValue>(props.tier);
  const [enabled, setEnabled] = useState(props.enabled);
  const [visibleToUsers, setVisibleToUsers] = useState(props.visibleToUsers);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/admin/models/${props.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier,
            enabled,
            visibleToUsers,
          }),
        });

        const result = (await response.json()) as ManagedModelUpdateResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "更新模型失败。" : (result.error ?? "更新模型失败。"));
        }

        setFeedback("已保存。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "更新模型失败。");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/admin/models/${props.id}`, {
          method: "DELETE",
        });

        const result = (await response.json()) as ManagedModelDeleteResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "删除模型失败。" : (result.error ?? "删除模型失败。"));
        }

        setFeedback("模型已删除。");
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "删除模型失败。");
      }
    });
  }

  return (
    <form className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
      <select className="field min-w-[120px]" onChange={(event) => setTier(event.target.value as ModelTierValue)} value={tier}>
        {tierOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input checked={enabled} onChange={(event) => setEnabled(event.target.checked)} type="checkbox" />
        启用
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input checked={visibleToUsers} onChange={(event) => setVisibleToUsers(event.target.checked)} type="checkbox" />
        对用户可见
      </label>
      <button className="pill" disabled={isPending} type="submit">
        {isPending ? "保存中..." : "保存"}
      </button>
      <button
        className="pill"
        disabled={isPending || props.routeUsageCount > 0}
        onClick={handleDelete}
        type="button"
      >
        {isPending ? "处理中..." : "删除模型"}
      </button>
      <Link className="pill" href="/admin/routing">
        去配置路由
      </Link>
      {props.routeUsageCount > 0 ? <span className="text-sm text-amber-700">当前有 {props.routeUsageCount} 条路由引用该模型，不能删除或停用。</span> : null}
      {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </form>
  );
}
