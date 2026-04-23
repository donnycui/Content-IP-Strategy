"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  BrainstormingModeValue,
  ModelTierValue,
  ProfileExtractConversationFinalizeResponse,
  ProfileExtractConversationReplyResponse,
  ProfileExtractionConversationSession,
  ProfileExtractConversationStartResponse,
} from "@/lib/domain/contracts";
import { ModelTierPicker } from "@/components/model-tier-picker";
import { ProfileExtractDraftPreview } from "@/components/profile-extract-draft-preview";

export function ProfileExtractConversation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [requestedTier, setRequestedTier] = useState<ModelTierValue>("BALANCED");
  const [brainstormingMode, setBrainstormingMode] = useState<BrainstormingModeValue>("AUTO");
  const [session, setSession] = useState<ProfileExtractionConversationSession | null>(null);
  const [checkedExistingSession, setCheckedExistingSession] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const participantNames = session?.participantNames ?? {
    userName: "你",
    agentName: "系统",
  };
  const emptyDraft = {
    name: "",
    positioning: "",
    persona: "",
    audience: "",
    coreThemes: "",
    voiceStyle: "",
    growthGoal: "",
    contentBoundaries: "",
    currentStage: "EXPLORING" as const,
  };

  function scrollToJudgment() {
    document.getElementById("ip-extraction-current-judgment")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function startConversation(forceNew = false) {
    startTransition(async () => {
      try {
        setFeedback("");
        setError("");
        setAnswer("");

        const response = await fetch("/api/profile/extract/conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestedTier,
            brainstormingMode,
            forceNew,
          }),
        });

        const result = (await response.json()) as ProfileExtractConversationStartResponse;

        if (!response.ok || !result.ok || !result.data?.session) {
          throw new Error(result.ok ? "开启新会话失败。" : (result.error ?? "开启新会话失败。"));
        }

        setSession(result.data.session);
      } catch (startError) {
        setError(startError instanceof Error ? startError.message : "开启新会话失败。");
      }
    });
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        setError("");
        const existingResponse = await fetch("/api/profile/extract/conversation");
        const existingResult = (await existingResponse.json()) as ProfileExtractConversationStartResponse;

        if (existingResponse.ok && existingResult.ok && existingResult.data?.session) {
          setSession(existingResult.data.session);
        }
      } catch (startError) {
        setError(startError instanceof Error ? startError.message : "启动对话式提炼失败。");
      } finally {
        setCheckedExistingSession(true);
      }
    });
    // Only create the initial conversation once on mount.
    // Tier and brainstorming mode changes affect subsequent turns, not automatic session recreation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitReply(skip = false) {
    if (!session) {
      return;
    }

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/profile/extract/conversation/${session.id}/reply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: answer,
            skip,
            requestedTier,
            brainstormingMode,
          }),
        });

        const result = (await response.json()) as ProfileExtractConversationReplyResponse;

        if (!response.ok || !result.ok || !result.data?.session) {
          throw new Error(result.ok ? "提交回答失败。" : (result.error ?? "提交回答失败。"));
        }

        setSession(result.data.session);
        setAnswer("");
      } catch (replyError) {
        setError(replyError instanceof Error ? replyError.message : "提交回答失败。");
      }
    });
  }

  function finalizeConversation() {
    if (!session) {
      return;
    }

    startTransition(async () => {
      try {
        setFeedback("");
        setError("");

        const response = await fetch(`/api/profile/extract/conversation/${session.id}/finalize`, {
          method: "POST",
        });

        const result = (await response.json()) as ProfileExtractConversationFinalizeResponse;

        if (!response.ok || !result.ok || !result.data?.profileId) {
          throw new Error(result.ok ? "生成最终画像失败。" : (result.error ?? "生成最终画像失败。"));
        }

        setFeedback("对话式提炼完成，已生成创作者画像。");
        router.push("/agents/creator-profile");
        router.refresh();
      } catch (finalizeError) {
        setError(finalizeError instanceof Error ? finalizeError.message : "生成最终画像失败。");
      }
    });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
      <section className="panel flex flex-col px-6 py-5 xl:max-h-[80vh] xl:overflow-hidden">
        <p className="section-kicker">对话式提炼</p>
        <h2 className="section-title mt-2">通过追问逐步收敛，而不是一次性压缩成模板</h2>
        <p className="section-desc mt-3">
          系统每次只问一个最有价值的问题，根据你的回答实时调整下一问，并同步更新右侧画像草案。
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <ModelTierPicker capabilityKey="ip_extraction_interview" onChange={setRequestedTier} value={requestedTier} />
          <div className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Brainstorming</span>
            <div className="flex flex-wrap gap-2">
              {(["OFF", "AUTO", "ON"] as BrainstormingModeValue[]).map((mode) => (
                <button
                  className={`pill transition ${brainstormingMode === mode ? "pill-active" : "hover:border-sky-400 hover:text-slate-800"}`}
                  key={mode}
                  onClick={() => setBrainstormingMode(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={scrollToJudgment}
              type="button"
            >
              回看当前判断
            </button>
            <button
              className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={() => startConversation(true)}
              type="button"
            >
              开启新会话
            </button>
          </div>
        </div>

        <p className="muted mt-3 text-sm leading-7">
          `OFF` 直接提炼，`AUTO` 系统自动判断是否先共创，`ON` 先发散再收敛。
        </p>

        <div className="mt-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
          {session ? (
            <div className="space-y-4">
              {session.transcript
                .filter((item: ProfileExtractionConversationSession["transcript"][number]) => item.role !== "system")
                .map((item: ProfileExtractionConversationSession["transcript"][number], index: number) => (
                  <div
                    className={`subpanel px-4 py-4 ${item.role === "assistant" ? "" : "ml-auto text-right"}`}
                    key={`${item.role}-${index}-${item.createdAt}`}
                  >
                    <p className={`text-sm font-semibold text-slate-700 ${item.role === "assistant" ? "" : "text-right"}`}>
                      {item.role === "assistant" ? participantNames.agentName : participantNames.userName}
                    </p>
                    <p className="muted mt-2 text-sm leading-7">{item.content}</p>
                    {item.meta?.responseMode ? (
                      <p className="muted mt-2 text-xs leading-6">
                        当前模式：{item.meta.responseMode === "BRAINSTORMING" ? "共创发散" : "提炼收敛"}
                      </p>
                    ) : null}
                  </div>
                ))}
            </div>
          ) : checkedExistingSession ? (
            <div className="subpanel px-5 py-5">
              <p className="text-sm font-semibold text-slate-800">准备开始新的 IP 提炼</p>
              <p className="muted mt-2 text-sm leading-7">
                当前没有进行中的会话。页面已经准备好了，你可以点击下方按钮开始新的提炼，而不是在首屏等待模型先生成问题。
              </p>
              <div className="mt-4">
                <button
                  className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-5 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                  onClick={() => startConversation(false)}
                  type="button"
                >
                  {isPending ? "启动中..." : "开始提炼"}
                </button>
              </div>
            </div>
          ) : (
            <div className="subpanel px-5 py-5">
              <p className="muted text-sm leading-7">正在检查是否存在未完成的会话...</p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-slate-200/80 pt-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">你的回答</span>
            <textarea
              className="min-h-36 rounded-3xl border px-4 py-4 text-sm leading-7 outline-none transition"
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={session ? "直接回答当前问题，尽量具体。" : "正在启动对话式提炼..."}
              value={answer}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-5 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !session}
              onClick={() => submitReply(false)}
              type="button"
            >
              {isPending ? "提交中..." : "提交回答"}
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !session}
              onClick={() => submitReply(true)}
              type="button"
            >
              跳过当前问题
            </button>
            <button
              className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !session || session.turnCount === 0}
              onClick={finalizeConversation}
              type="button"
            >
              生成画像草案
            </button>
            {feedback ? <span className="text-sm text-emerald-700">{feedback}</span> : null}
            {error ? <span className="text-sm text-rose-600">{error}</span> : null}
          </div>
        </div>
      </section>

      <ProfileExtractDraftPreview draft={session?.draftProfile ?? emptyDraft} />
    </section>
  );
}
