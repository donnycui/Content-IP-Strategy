import Link from "next/link";
import { ProfileUpdateGenerateButton } from "@/components/profile-update-generate-button";
import { ProfileUpdateStatusActions } from "@/components/profile-update-status-actions";
import { getActiveProfileForSuggestions, getProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-data";

export const dynamic = "force-dynamic";

const suggestionTypeLabels = {
  POSITIONING: "定位更新",
  PERSONA: "人设更新",
  AUDIENCE: "受众更新",
  CORE_THEME: "核心议题更新",
  VOICE_STYLE: "表达风格更新",
  GROWTH_GOAL: "增长目标更新",
  CONTENT_BOUNDARY: "内容边界更新",
  CURRENT_STAGE: "成长阶段更新",
  DIRECTION_WEIGHT: "方向权重更新",
} as const;

const suggestionStatusLabels = {
  PENDING: "待确认",
  ACCEPTED: "已采纳",
  REJECTED: "已拒绝",
} as const;

const stageLabels = {
  EXPLORING: "探索期",
  EMERGING: "成长期",
  SCALING: "扩张期",
  ESTABLISHED: "稳定期",
} as const;

function renderValue(value?: string | null) {
  if (!value) {
    return "暂无";
  }

  return stageLabels[value as keyof typeof stageLabels] ?? value;
}

export default async function EvolutionPage() {
  const [profile, suggestions] = await Promise.all([getActiveProfileForSuggestions(), getProfileUpdateSuggestions()]);

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="section-kicker">进化建议</p>
            <h2 className="section-title mt-2">让系统提出画像变化建议，但由你确认是否吸收</h2>
            <p className="section-desc mt-3">
              画像不是自动改写的。平台会持续观察你的方向、主题、选题和复核行为，再提出“你正在发生什么变化”的建议，由你来决定是否更新到创作者画像。
            </p>
          </div>
          <ProfileUpdateGenerateButton />
        </div>
      </section>

      <section className="panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="metric-label">当前画像锚点</p>
            <p className="text-lg font-semibold">{profile.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/profile">
              查看创作者画像
            </Link>
            <Link className="pill hover:border-sky-400 hover:text-slate-800" href="/candidates">
              打开选题台
            </Link>
          </div>
        </div>
        <p className="muted mt-3 text-sm leading-7">{profile.positioning}</p>
      </section>

      {suggestions.length ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {suggestions.map((suggestion) => (
            <div className="panel space-y-4 px-6 py-5" key={suggestion.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="pill">{suggestionTypeLabels[suggestion.type]}</span>
                  <span className="pill">{suggestionStatusLabels[suggestion.status]}</span>
                </div>
                <span className="pill">置信度 {(suggestion.confidence ?? 0).toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">{suggestionTypeLabels[suggestion.type]}</p>
                <p className="muted text-sm leading-7">{suggestion.reason}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="subpanel px-4 py-4">
                  <p className="text-sm font-semibold text-slate-700">当前值</p>
                  <p className="muted mt-2 text-sm leading-7">{renderValue(suggestion.beforeValue)}</p>
                </div>
                <div className="subpanel px-4 py-4">
                  <p className="text-sm font-semibold text-slate-700">建议值</p>
                  <p className="muted mt-2 text-sm leading-7">{renderValue(suggestion.suggestedValue)}</p>
                </div>
              </div>
              <ProfileUpdateStatusActions suggestionId={suggestion.id} currentStatus={suggestion.status} />
            </div>
          ))}
        </section>
      ) : (
        <section className="panel px-6 py-8">
          <p className="text-lg font-semibold">当前还没有画像进化建议。</p>
          <p className="muted mt-2 max-w-3xl text-sm leading-7">
            先积累方向、主题线、选题决策和人工复核，再点击“刷新进化建议”。平台才会有足够的上下文来提出可信的画像更新建议。
          </p>
        </section>
      )}
    </main>
  );
}
