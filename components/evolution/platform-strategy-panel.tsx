import { getPlatformStrategyMemos } from "@/lib/services/platform-strategy-service";

export async function PlatformStrategyPanel() {
  const memos = await getPlatformStrategyMemos();

  return (
    <section className="panel px-6 py-6">
      <div className="space-y-3">
        <p className="section-kicker">Platform Strategy</p>
        <h2 className="section-title">当前平台策略备忘</h2>
        <p className="section-desc">
          这里接收 `PLATFORM_STRATEGY` 类型的进化决策。当前先以 memo 形式沉淀，后续再升级成更细的平台策略规则体系。
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {memos.length ? (
          memos.map((memo) => (
            <div className="subpanel px-4 py-4" key={memo.id}>
              <div className="flex flex-wrap gap-2">
                <span className="pill">{memo.channelKey}</span>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-800">{memo.headline}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{memo.summary}</p>
              {memo.detail ? <p className="muted mt-3 text-sm leading-7">{memo.detail}</p> : null}
            </div>
          ))
        ) : (
          <p className="muted text-sm leading-7">当前还没有平台策略 memo。先通过复盘生成并采纳一条 `PLATFORM_STRATEGY` 决策。</p>
        )}
      </div>
    </section>
  );
}
