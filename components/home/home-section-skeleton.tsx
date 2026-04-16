export function HomeSectionSkeleton({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="panel px-6 py-5">
      <div className="space-y-4">
        <div className="h-3 w-24 rounded-full bg-slate-200/70" />
        <div className="h-8 w-56 rounded-full bg-slate-200/70" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded-full bg-slate-200/60" />
          <div className="h-4 w-5/6 rounded-full bg-slate-200/60" />
          {compact ? null : <div className="h-4 w-4/6 rounded-full bg-slate-200/60" />}
        </div>
      </div>
    </div>
  );
}
