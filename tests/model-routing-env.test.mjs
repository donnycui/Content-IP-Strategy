import assert from "node:assert/strict";

import { buildGatewayAdminApiEndpoint } from "../lib/models/openai-endpoints.ts";
import {
  DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY,
  getCapabilityAliasEnvName,
  normalizeGatewayRuntimeAuthType,
  normalizeGatewayRuntimeProtocol,
  resolveGatewayEnvironmentConfig,
} from "../lib/services/model-routing-env.ts";

assert.equal(
  buildGatewayAdminApiEndpoint("https://gateway.example.com", "/gateway/aliases"),
  "https://gateway.example.com/admin/gateway/aliases",
);

assert.equal(
  buildGatewayAdminApiEndpoint("https://gateway.example.com/v1", "/gateway/aliases"),
  "https://gateway.example.com/admin/gateway/aliases",
);

assert.equal(getCapabilityAliasEnvName("topic_generation"), "MODEL_ROUTER_ALIAS_TOPIC_GENERATION");

assert.equal(normalizeGatewayRuntimeAuthType("api_key"), "api_key");
assert.equal(normalizeGatewayRuntimeAuthType("weird-value"), "bearer");
assert.equal(normalizeGatewayRuntimeProtocol("openai-responses"), "openai-responses");
assert.equal(normalizeGatewayRuntimeProtocol("something-else"), "openai-chat-completions");

const explicitConfig = resolveGatewayEnvironmentConfig("signal_scoring", {
  MODEL_ROUTER_GATEWAY_BASE_URL: "https://gateway.example.com/v1/",
  MODEL_ROUTER_GATEWAY_CLIENT_KEY: "zgk_test",
  MODEL_ROUTER_GATEWAY_AUTH_TYPE: "api_key",
  MODEL_ROUTER_GATEWAY_PROTOCOL: "openai-responses",
  MODEL_ROUTER_ALIAS_SIGNAL_SCORING: "signal/custom",
});

assert.ok(explicitConfig);
assert.equal(explicitConfig.baseUrl, "https://gateway.example.com/v1");
assert.equal(explicitConfig.alias, "signal/custom");
assert.equal(explicitConfig.authType, "api_key");
assert.equal(explicitConfig.protocol, "openai-responses");
assert.equal(explicitConfig.authSecret, "zgk_test");
assert.equal(explicitConfig.authSecretRef, "MODEL_ROUTER_GATEWAY_CLIENT_KEY");
assert.equal(explicitConfig.providerKey, "gateway-alias");

const signalConfig = resolveGatewayEnvironmentConfig("signal_scoring", {
  ZHAOCAI_GATEWAY_BASE_URL: "https://gateway.example.com",
  ZHAOCAI_GATEWAY_CLIENT_KEY: "zgk_test",
});
const balancedConfig = resolveGatewayEnvironmentConfig("topic_generation", {
  ZHAOCAI_GATEWAY_BASE_URL: "https://gateway.example.com",
  ZHAOCAI_GATEWAY_CLIENT_KEY: "zgk_test",
});
const draftConfig = resolveGatewayEnvironmentConfig("draft_generation", {
  ZHAOCAI_GATEWAY_BASE_URL: "https://gateway.example.com",
  ZHAOCAI_GATEWAY_CLIENT_KEY: "zgk_test",
});

assert.equal(signalConfig?.alias, DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY.signal_scoring);
assert.equal(balancedConfig?.alias, DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY.topic_generation);
assert.equal(draftConfig?.alias, DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY.draft_generation);
assert.equal(signalConfig?.authSecretRef, "ZHAOCAI_GATEWAY_CLIENT_KEY");

assert.equal(
  resolveGatewayEnvironmentConfig("signal_scoring", {
    MODEL_ROUTER_GATEWAY_CLIENT_KEY: "zgk_test",
  }),
  null,
);

console.log("gateway alias env smoke checks passed");
