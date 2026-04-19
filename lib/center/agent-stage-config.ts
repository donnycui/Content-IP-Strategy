import type { CenterAgentKeyValue } from "@/lib/domain/contracts";

export type AgentRouteKey =
  | "ip-extraction"
  | "creator-profile"
  | "topic-direction"
  | "style-content"
  | "daily-review"
  | "evolution";

export const AGENT_ROUTE_KEY_BY_CENTER_AGENT: Record<CenterAgentKeyValue, AgentRouteKey> = {
  IP_EXTRACTION: "ip-extraction",
  CREATOR_PROFILE: "creator-profile",
  TOPIC_DIRECTION: "topic-direction",
  STYLE_CONTENT: "style-content",
  DAILY_REVIEW: "daily-review",
  EVOLUTION: "evolution",
};

export const CENTER_AGENT_KEY_BY_ROUTE: Record<AgentRouteKey, CenterAgentKeyValue> = {
  "ip-extraction": "IP_EXTRACTION",
  "creator-profile": "CREATOR_PROFILE",
  "topic-direction": "TOPIC_DIRECTION",
  "style-content": "STYLE_CONTENT",
  "daily-review": "DAILY_REVIEW",
  evolution: "EVOLUTION",
};

export function getAgentRoutePath(agentKey: CenterAgentKeyValue) {
  return `/agents/${AGENT_ROUTE_KEY_BY_CENTER_AGENT[agentKey]}`;
}

export function isAgentRouteKey(value: string): value is AgentRouteKey {
  return value in CENTER_AGENT_KEY_BY_ROUTE;
}
