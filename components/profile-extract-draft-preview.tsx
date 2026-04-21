import type { ProfileExtractionConversationDraft } from "@/lib/domain/contracts";

export function ProfileExtractDraftPreview({
  draft,
}: {
  draft: ProfileExtractionConversationDraft;
}) {
  const items: Array<{ label: string; value: string }> = [
    { label: "定位", value: draft.positioning },
    { label: "人设", value: draft.persona },
    { label: "受众", value: draft.audience },
    { label: "核心议题", value: draft.coreThemes },
    { label: "表达风格", value: draft.voiceStyle },
    { label: "增长目标", value: draft.growthGoal },
    { label: "内容边界", value: draft.contentBoundaries },
  ];

  return (
    <section className="panel flex flex-col px-6 py-5 xl:max-h-[80vh] xl:overflow-hidden">
      <p className="section-kicker">实时画像草案</p>
      <h2 className="section-title mt-2">系统正在根据对话逐步理解你</h2>
      <p className="section-desc mt-3">这是访谈过程中形成的草案，会随着每轮对话不断更新，不会直接覆盖最终画像。</p>
      <div className="mt-6 grid gap-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
        <div className="subpanel px-4 py-4">
          <p className="text-sm font-semibold text-slate-700">当前阶段</p>
          <p className="muted mt-2 text-sm leading-7">{draft.currentStage}</p>
        </div>
        {items.map((item) => (
          <div className="subpanel px-4 py-4" key={item.label}>
            <p className="text-sm font-semibold text-slate-700">{item.label}</p>
            <p className="muted mt-2 text-sm leading-7">{item.value || "系统还在收敛这一项。"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
