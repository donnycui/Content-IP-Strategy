export function buildEditorialAngle(input: {
  clusterTitle: string;
  supportingSignals: Array<{
    importanceScore: number;
  }>;
}) {
  const signalCount = input.supportingSignals.length;
  const averageImportance =
    input.supportingSignals.reduce((sum, signal) => sum + signal.importanceScore, 0) / Math.max(signalCount, 1);

  if (signalCount >= 3 && averageImportance >= 4) {
    return {
      angleType: "专题系列入口",
      guidance: `这个判断更适合作为 ${input.clusterTitle} 的专题系列入口，因为支撑信号已经形成持续堆积。`,
    };
  }

  if (signalCount >= 2 || averageImportance >= 3.8) {
    return {
      angleType: "连续主题跟踪",
      guidance: `这个判断更适合作为连续主题跟踪内容，因为支撑信号正在把 ${input.clusterTitle} 推向更清晰的趋势。`,
    };
  }

  return {
    angleType: "单条快判断",
    guidance: `这个判断更适合作为单条快判断，因为当前支撑信号还不足以支撑长线系列，但已经足够说明为什么现在值得发。`,
  };
}
