import Link from "next/link";
import type { PublishRecordPayload } from "@/lib/domain/contracts";

const packageFieldLabels: Record<string, string> = {
  assetType: "资产类型",
  targetPlatform: "目标平台",
  title: "标题",
};

export function PublishRecordPackage({ record }: { record: PublishRecordPayload }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">发布准备</p>
            <p className="muted mt-1 text-xs leading-5">这里保留导出和发布状态，具体 JSON 信息默认收起。</p>
          </div>
          <span className="pill">{record.status}</span>
        </div>
      </summary>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
        <span className="pill">{record.channelKey}</span>
        <span className="pill">{record.mode}</span>
      </div>
      {record.packageJson ? (
        <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
          {Object.entries(record.packageJson).map(([key, value]) => (
            <p key={key}>
              <span className="font-medium text-slate-800">{packageFieldLabels[key] ?? key}</span>：{String(value ?? "暂无")}
            </p>
          ))}
        </div>
      ) : (
        <p className="muted mt-3 text-sm leading-7">当前还没有更细的导出包描述，后续会扩到多平台素材与发布参数。</p>
      )}
      <div className="mt-3">
        <Link
          className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
          href={`/api/publish-records/${record.id}/package`}
          target="_blank"
        >
          打开导出包 JSON
        </Link>
      </div>
      {record.failureReason ? <p className="muted mt-3 text-sm leading-7">{record.failureReason}</p> : null}
    </details>
  );
}
