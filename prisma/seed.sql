INSERT INTO "Source" ("id", "name", "type", "baseUrl", "feedUrl", "isActive", "qualityScore", "createdAt", "updatedAt")
VALUES
  ('source-ft', 'Financial Times', 'WEBSITE', 'https://www.ft.com', NULL, true, 4.7, NOW(), NOW()),
  ('source-the-information', 'The Information', 'WEBSITE', 'https://www.theinformation.com', NULL, true, 4.6, NOW(), NOW()),
  ('source-reuters', 'Reuters', 'RSS', 'https://www.reuters.com', 'https://www.reutersagency.com/feed/', true, 4.4, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Signal" ("id", "sourceId", "title", "url", "author", "language", "publishedAt", "ingestedAt", "rawContent", "summary", "status", "createdAt", "updatedAt")
VALUES
  ('signal-ai-capex', 'source-ft', 'Cloud capex acceleration suggests AI infrastructure is becoming the new power bottleneck', 'https://example.com/signals/ai-capex', 'FT Staff', 'en', NOW(), NOW(), NULL, 'Infrastructure spending is turning into a leverage story, not only a demand story.', 'CANDIDATE', NOW(), NOW()),
  ('signal-platform-margin', 'source-the-information', 'Consumer internet margins compress as distribution power migrates toward new AI-native entry points', 'https://example.com/signals/platform-margin', 'The Information', 'en', NOW(), NOW(), NULL, 'Margin pressure may reflect structural distribution displacement.', 'NEW', NOW(), NOW()),
  ('signal-policy-semiconductor', 'source-reuters', 'A new semiconductor policy package points to a longer cycle of industrial concentration', 'https://example.com/signals/semiconductor-policy', 'Reuters', 'en', NOW(), NOW(), NULL, 'Policy support continues to signal strategic capacity concentration.', 'DEFERRED', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SignalTag" ("id", "signalId", "tag", "tagType")
VALUES
  ('tag-ai-capex-topic-1', 'signal-ai-capex', 'AI', 'TOPIC'),
  ('tag-ai-capex-topic-2', 'signal-ai-capex', 'Capex', 'TOPIC'),
  ('tag-ai-capex-theme', 'signal-ai-capex', 'Capital flows reveal era choices', 'MOTHER_THEME'),
  ('tag-platform-margin-topic-1', 'signal-platform-margin', 'Platforms', 'TOPIC'),
  ('tag-platform-margin-topic-2', 'signal-platform-margin', 'Margins', 'TOPIC'),
  ('tag-platform-margin-theme', 'signal-platform-margin', 'Business models are re-evaluated in a new cycle', 'MOTHER_THEME'),
  ('tag-semiconductor-policy-topic-1', 'signal-policy-semiconductor', 'Semiconductors', 'TOPIC'),
  ('tag-semiconductor-policy-topic-2', 'signal-policy-semiconductor', 'Policy', 'TOPIC'),
  ('tag-semiconductor-policy-theme', 'signal-policy-semiconductor', 'Technological revolutions rewrite power structures', 'MOTHER_THEME')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SignalScore" ("id", "signalId", "importanceScore", "viewpointScore", "consensusStrength", "companyRoutineScore", "structuralScore", "impactScore", "redistributionScore", "durabilityScore", "confidenceScore", "priorityRecommendation", "reasoningSummary", "reasoningDetail", "modelName", "createdAt")
VALUES
  ('score-ai-capex', 'signal-ai-capex', 4.8, 4.5, 2.4, 1.4, 4.9, 4.6, 4.8, 4.7, 4.3, 'PRIORITIZE', 'This is not a product story. It is a power concentration story hidden inside infrastructure spending.', 'Infrastructure bottlenecks often precede downstream pricing power consolidation.', 'seed-model-v0', NOW()),
  ('score-platform-margin', 'signal-platform-margin', 4.2, 4.7, 2.8, 2.1, 4.4, 4.3, 4.5, 4.2, 4.0, 'PRIORITIZE', 'The signal matters because it reframes margin pressure as structural distribution displacement, not temporary weakness.', 'The real issue is who owns the new traffic and decision surfaces.', 'seed-model-v0', NOW()),
  ('score-semiconductor-policy', 'signal-policy-semiconductor', 4.6, 4.1, 4.4, 1.6, 4.7, 4.5, 4.6, 4.8, 4.1, 'WATCH', 'The direct policy detail is less important than the signal that strategic capacity will remain politically priced.', 'Industrial policy continues to shape who can scale capacity under geopolitical pressure.', 'seed-model-v0', NOW())
ON CONFLICT ("id") DO NOTHING;
