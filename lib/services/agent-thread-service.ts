import type {
  AgentThreadRecord,
  AgentThreadStatusValue,
  CenterAgentKeyValue,
  CenterAgentSummaryPayload,
  CenterAgentThreadMessage,
  CenterWorkspaceRecord,
} from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { ensureActiveCenterWorkspace } from "@/lib/services/center-workspace-service";

export const ALL_CENTER_AGENT_KEYS: CenterAgentKeyValue[] = [
  "IP_EXTRACTION",
  "CREATOR_PROFILE",
  "TOPIC_DIRECTION",
  "STYLE_CONTENT",
  "DAILY_REVIEW",
  "EVOLUTION",
];

function mapAgentThread(thread: {
  id: string;
  workspaceId: string;
  agentKey: CenterAgentKeyValue;
  status: AgentThreadStatusValue;
  transcriptJson: unknown;
  summaryJson: unknown;
  latestSummary: string | null;
  nextRecommendedAction: string | null;
  lastUserMessage: string | null;
  updatedAt: Date;
}): AgentThreadRecord {
  const transcript = Array.isArray(thread.transcriptJson) ? (thread.transcriptJson as CenterAgentThreadMessage[]) : [];
  const summary =
    thread.summaryJson && typeof thread.summaryJson === "object" && !Array.isArray(thread.summaryJson)
      ? (thread.summaryJson as AgentThreadRecord["summary"])
      : null;

  return {
    id: thread.id,
    workspaceId: thread.workspaceId,
    agentKey: thread.agentKey,
    status: thread.status,
    transcript,
    summary,
    latestSummary: thread.latestSummary,
    nextRecommendedAction: thread.nextRecommendedAction,
    lastUserMessage: thread.lastUserMessage,
    updatedAt: thread.updatedAt.toISOString(),
  };
}

function buildMockThread(
  workspace: Pick<CenterWorkspaceRecord, "id">,
  agentKey: CenterAgentKeyValue,
  input?: {
    status?: AgentThreadStatusValue;
    latestSummary?: string | null;
    nextRecommendedAction?: string | null;
  },
): AgentThreadRecord {
  return {
    id: `agent-thread-${agentKey.toLowerCase()}`,
    workspaceId: workspace.id,
    agentKey,
    status: input?.status ?? "IDLE",
    transcript: [],
    summary: null,
    latestSummary: input?.latestSummary ?? null,
    nextRecommendedAction: input?.nextRecommendedAction ?? null,
    lastUserMessage: null,
    updatedAt: new Date().toISOString(),
  };
}

function buildThreadUpdateData(input: {
  status?: AgentThreadStatusValue;
  latestSummary?: string | null;
  nextRecommendedAction?: string | null;
  lastUserMessage?: string | null;
  transcript?: CenterAgentThreadMessage[];
  summary?: AgentThreadRecord["summary"];
}) {
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(input.latestSummary !== undefined ? { latestSummary: input.latestSummary } : {}),
    ...(input.nextRecommendedAction !== undefined ? { nextRecommendedAction: input.nextRecommendedAction } : {}),
    ...(input.lastUserMessage !== undefined ? { lastUserMessage: input.lastUserMessage } : {}),
    ...(input.transcript !== undefined ? { transcriptJson: input.transcript } : {}),
    ...(input.summary !== undefined ? { summaryJson: input.summary ?? null } : {}),
  };
}

export async function getAgentThreadsForWorkspace(workspaceId: string): Promise<AgentThreadRecord[]> {
  if (!process.env.DATABASE_URL) {
    return ALL_CENTER_AGENT_KEYS.map((agentKey) => buildMockThread({ id: workspaceId }, agentKey));
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      agentThread?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const threads = await prismaClient.agentThread?.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return (threads ?? []).map((thread) => mapAgentThread(thread as Parameters<typeof mapAgentThread>[0]));
  } catch {
    return ALL_CENTER_AGENT_KEYS.map((agentKey) => buildMockThread({ id: workspaceId }, agentKey));
  }
}

export async function ensureStageAgentThreads(
  workspaceOrId: CenterWorkspaceRecord | string,
): Promise<AgentThreadRecord[]> {
  const workspaceId = typeof workspaceOrId === "string" ? workspaceOrId : workspaceOrId.id;

  if (!process.env.DATABASE_URL) {
    return ALL_CENTER_AGENT_KEYS.map((agentKey) => buildMockThread({ id: workspaceId }, agentKey));
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      agentThread?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
      $transaction: typeof prisma.$transaction;
    };

    await prismaClient.$transaction(
      ALL_CENTER_AGENT_KEYS.map((agentKey) =>
        prismaClient.agentThread!.upsert({
          where: {
            workspaceId_agentKey: {
              workspaceId,
              agentKey,
            },
          },
          update: {},
          create: {
            workspaceId,
            agentKey,
            status: "IDLE",
            transcriptJson: [],
          },
        }),
      ),
    );

    return getAgentThreadsForWorkspace(workspaceId);
  } catch {
    return ALL_CENTER_AGENT_KEYS.map((agentKey) => buildMockThread({ id: workspaceId }, agentKey));
  }
}

export async function syncCenterAgentThreads(input: {
  workspace?: CenterWorkspaceRecord | null;
  currentAgentKey: CenterAgentKeyValue;
  agentSummaries: CenterAgentSummaryPayload[];
}): Promise<AgentThreadRecord[]> {
  const workspace = input.workspace ?? (await ensureActiveCenterWorkspace());

  if (!process.env.DATABASE_URL) {
    return input.agentSummaries.map((agent) =>
      buildMockThread(
        workspace,
        agent.key,
        {
          status: agent.key === input.currentAgentKey ? "ACTIVE" : "IDLE",
          latestSummary: agent.summary,
          nextRecommendedAction: agent.actionLabel,
        },
      ),
    );
  }

  try {
    await ensureStageAgentThreads(workspace);

    const prismaClient = prisma as typeof prisma & {
      agentThread?: {
        update: (args: unknown) => Promise<unknown>;
      };
      $transaction: typeof prisma.$transaction;
    };

    await prismaClient.$transaction(
      input.agentSummaries.map((agent) =>
        prismaClient.agentThread!.update({
          where: {
            workspaceId_agentKey: {
              workspaceId: workspace.id,
              agentKey: agent.key,
            },
          },
          data: buildThreadUpdateData({
            status: agent.key === input.currentAgentKey ? "ACTIVE" : "IDLE",
            latestSummary: agent.summary,
            nextRecommendedAction: agent.actionLabel,
            summary: {
              headline: agent.detail,
              assets: agent.note ? [agent.note] : [],
            },
          }),
        }),
      ),
    );

    return getAgentThreadsForWorkspace(workspace.id);
  } catch {
    return input.agentSummaries.map((agent) =>
      buildMockThread(
        workspace,
        agent.key,
        {
          status: agent.key === input.currentAgentKey ? "ACTIVE" : "IDLE",
          latestSummary: agent.summary,
          nextRecommendedAction: agent.actionLabel,
        },
      ),
    );
  }
}
