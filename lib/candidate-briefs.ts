import type { SignalRow } from "@/lib/mock-data";

export function buildCandidateClusterBrief(cluster: string, signals: SignalRow[]) {
  const averageImportance =
    signals.reduce((sum, signal) => sum + signal.importanceScore, 0) / Math.max(signals.length, 1);
  const averageViewpoint =
    signals.reduce((sum, signal) => sum + signal.viewpointScore, 0) / Math.max(signals.length, 1);
  const hasSecondarySpread = signals.some((signal) => signal.secondaryObservationCluster);

  const topicLine =
    signals.length >= 2
      ? `${cluster} 这个观察簇正在积累多条候选信号，说明这不是孤立事件。`
      : `${cluster} 已经出现可用候选，但还更像一个早期观察点。`;

  const timingLine =
    averageImportance >= 4.2
      ? "现在值得讲，因为这里已经出现了足够明确的结构性信号。"
      : "现在更适合作为持续观察对象，而不是立刻重投入。";

  let actionLine = "更适合先做一条短判断，验证外界反馈。";

  if (signals.length >= 3 || (averageImportance >= 4.2 && averageViewpoint >= 4)) {
    actionLine = "更适合升级成连续专题，持续跟踪这个观察簇的变化。";
  } else if (hasSecondarySpread) {
    actionLine = "更适合做一条带外溢关系的判断，强调这个簇与其他观察簇的连接。";
  }

  return {
    topicLine,
    timingLine,
    actionLine,
  };
}
