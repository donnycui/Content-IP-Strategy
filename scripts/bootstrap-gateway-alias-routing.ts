import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;

const DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY = {
  signal_scoring: "signal/deep",
  ip_extraction_interview: "balanced",
  ip_strategy_report: "balanced",
  direction_generation: "balanced",
  topic_generation: "balanced",
  topic_candidate_generation: "balanced",
  profile_evolution: "balanced",
  draft_generation: "draft/deep",
} as const;

type Args = {
  write: boolean;
  gatewayName: string;
  help: boolean;
};

type RoutePreview = {
  capabilityKey: keyof typeof DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY;
  aliasKey: string;
  defaultModelId: string;
  existingDefaultLabel: string | null;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    write: false,
    gatewayName: process.env.MODEL_ROUTER_GATEWAY_NAME?.trim() || "zhaocai-gateway-v2",
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--write") {
      args.write = true;
      continue;
    }

    if (arg === "--gateway-name") {
      args.gatewayName = argv[index + 1]?.trim() || args.gatewayName;
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:

  node --experimental-strip-types scripts/bootstrap-gateway-alias-routing.ts [--write] [--gateway-name <name>]

Behavior:

  - Default mode is dry-run
  - Use --write to persist capability routes
  - Default gateway name is "zhaocai-gateway-v2"
`);
}

async function main() {
  loadEnvConfig(process.cwd());

  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient();

  try {
    const gateway = await prisma.gatewayConnection.findUnique({
      where: {
        name: args.gatewayName,
      },
    });

    if (!gateway) {
      throw new Error(`Gateway access "${args.gatewayName}" was not found.`);
    }

    const aliases = await prisma.managedModel.findMany({
      where: {
        gatewayConnectionId: gateway.id,
        providerKey: "gateway-alias",
      },
      orderBy: {
        modelKey: "asc",
      },
    });

    const aliasByKey = new Map(aliases.map((alias) => [alias.modelKey, alias]));
    const previews: RoutePreview[] = [];
    const missingAliases: string[] = [];

    for (const [capabilityKey, aliasKey] of Object.entries(DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY) as Array<
      [keyof typeof DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY, string]
    >) {
      const alias = aliasByKey.get(aliasKey);

      if (!alias) {
        missingAliases.push(`${capabilityKey} -> ${aliasKey}`);
        continue;
      }

      const existingRoute = await prisma.capabilityRoute.findUnique({
        where: {
          capabilityKey,
        },
        include: {
          defaultModel: true,
        },
      });

      previews.push({
        capabilityKey,
        aliasKey,
        defaultModelId: alias.id,
        existingDefaultLabel: existingRoute?.defaultModel?.modelKey ?? null,
      });
    }

    console.log(`Gateway access: ${gateway.name}`);
    console.log(`Mode: ${args.write ? "write" : "dry-run"}`);
    console.log("");

    if (missingAliases.length > 0) {
      console.log("Missing aliases:");
      for (const line of missingAliases) {
        console.log(`- ${line}`);
      }
      console.log("");
    }

    console.log("Planned routes:");
    for (const preview of previews) {
      console.log(
        `- ${preview.capabilityKey}: ${preview.existingDefaultLabel ?? "(unconfigured)"} -> ${preview.aliasKey}`,
      );
    }
    console.log("");

    if (missingAliases.length > 0) {
      throw new Error("One or more recommended aliases are missing. Sync aliases or create them first.");
    }

    if (!args.write) {
      console.log('Dry-run complete. Re-run with "--write" to persist these routes.');
      return;
    }

    await prisma.$transaction(
      previews.map((preview) =>
        prisma.capabilityRoute.upsert({
          where: {
            capabilityKey: preview.capabilityKey,
          },
          update: {
            defaultModelId: preview.defaultModelId,
            fallbackModelId: null,
            allowFallback: false,
            allowUserOverride: false,
          },
          create: {
            capabilityKey: preview.capabilityKey,
            defaultModelId: preview.defaultModelId,
            fallbackModelId: null,
            allowFallback: false,
            allowUserOverride: false,
            notes: "Bootstrapped to gateway alias routing.",
          },
        }),
      ),
    );

    console.log(`Updated ${previews.length} capability routes.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
