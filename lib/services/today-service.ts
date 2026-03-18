import { getDraftsByResearchCardId, getResearchCardPreview, getSignals } from "@/lib/data";
import { mockCreatorProfile } from "@/lib/profile-data";
import { getActiveDirectionsService } from "@/lib/services/direction-service";
import { getActiveCreatorProfileService } from "@/lib/services/profile-service";
import { getProfileEvolutionSuggestionsService } from "@/lib/services/profile-evolution-service";
import { getTopicCandidatesService } from "@/lib/services/topic-candidate-service";
import { getTopicsService } from "@/lib/services/topic-service";

export async function getTodayWorkspaceService() {
  const [profile, directions, topics, topicCandidates, suggestions, signals, latestResearchCard] = await Promise.all([
    getActiveCreatorProfileService(),
    getActiveDirectionsService(),
    getTopicsService(),
    getTopicCandidatesService(),
    getProfileEvolutionSuggestionsService(),
    getSignals(),
    getResearchCardPreview(),
  ]);

  const activeProfile = profile ?? mockCreatorProfile;
  const activeSuggestions = suggestions.filter((suggestion) => suggestion.status === "PENDING").slice(0, 3);
  const keptRecommendations = topicCandidates.filter((candidate) => candidate.status === "KEPT");
  const freshRecommendations = topicCandidates
    .filter((candidate) => candidate.status === "NEW" || candidate.status === "KEPT")
    .slice(0, 4);
  const newSignals = signals.filter((signal) => signal.status === "NEW").slice(0, 4);

  const latestResearchCardId = "id" in latestResearchCard ? latestResearchCard.id : null;
  const latestDrafts = latestResearchCardId ? await getDraftsByResearchCardId(latestResearchCardId) : [];

  return {
    profile: activeProfile,
    directions: directions.slice(0, 3),
    topics: topics.slice(0, 4),
    topicCandidates: freshRecommendations,
    pendingSuggestions: activeSuggestions,
    keptRecommendationsCount: keptRecommendations.length,
    signals: {
      newSignals,
      total: signals.length,
    },
    output: latestResearchCard
      ? {
          latestResearchCard,
          latestResearchCardId,
          latestDraftsCount: latestDrafts.length,
        }
      : null,
  };
}
