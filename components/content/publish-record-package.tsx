import type { PublishRecordPayload } from "@/lib/domain/contracts";

export function PublishRecordPackage({ record }: { record: PublishRecordPayload }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
      <p className="text-sm font-semibold text-slate-800">导出包信息</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="pill">{record.channelKey}</span>
        <span className="pill">{record.mode}</span>
        <span className="pill">{record.status}</span>
      </div>
      {record.packageJson ? (
        <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
          {Object.entries(record.packageJson).map(([key, value]) => (
            <p key={key}>
              <span className="font-medium text-slate-800">{key}</span>：{String(value ?? "暂无")}
            </p>
          ))}
        </div>
      ) : (
        <p className="muted mt-3 text-sm leading-7">当前还没有更细的导出包描述，后续会扩到多平台素材与发布参数。</p>
      )}
      {record.failureReason ? <p className="muted mt-3 text-sm leading-7">{record.failureReason}</p> : null}
    </div>
  );
}
