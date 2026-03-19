"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type UnlockResponse = {
  ok: boolean;
  error?: string;
  data?: {
    redirectTo: string;
  };
};

export function AccessGateForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const next = searchParams.get("next") || "/";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        setError("");

        const response = await fetch("/api/access/unlock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            next,
          }),
        });

        const result = (await response.json()) as UnlockResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "口令验证失败。");
        }

        window.location.href = result.data?.redirectTo || "/";
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "口令验证失败。");
      }
    });
  }

  return (
    <form className="subpanel space-y-4 px-6 py-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">访问口令</p>
        <input
          autoFocus
          className="field w-full"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="请输入 staging 访问口令"
          type="password"
          value={password}
        />
      </div>
      <button
        className="rounded-2xl border border-sky-300/40 bg-sky-400/10 px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:opacity-50"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "验证中..." : "进入工作台"}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
