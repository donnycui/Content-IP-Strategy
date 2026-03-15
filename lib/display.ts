export const motherThemeLabels: Record<string, string> = {
  "Technological revolutions rewrite power structures": "技术革命如何改写权力结构",
  "Capital flows reveal era choices": "资本流向如何预示时代选择",
  "Business models are re-evaluated in a new cycle": "商业模式如何在新周期里重估",
  "Individuals and organizations should reposition": "个体与组织如何重新定位自己",
};

export const topicTagLabels: Record<string, string> = {
  AI: "人工智能",
  Capex: "资本开支",
  Cloud: "云计算",
  Platforms: "平台",
  Margins: "利润率",
  Semiconductors: "半导体",
  Policy: "政策",
  Industry: "产业",
};

export const sourceNameLabels: Record<string, string> = {
  "Financial Times": "金融时报",
  "The Information": "The Information",
  Reuters: "路透",
};

export function getMotherThemeLabel(value?: string | null) {
  if (!value) {
    return "-";
  }

  return motherThemeLabels[value] ?? value;
}

export function getTopicTagLabel(value?: string | null) {
  if (!value) {
    return "-";
  }

  return topicTagLabels[value] ?? value;
}

export function getSourceNameLabel(value?: string | null) {
  if (!value) {
    return "-";
  }

  return sourceNameLabels[value] ?? value;
}
