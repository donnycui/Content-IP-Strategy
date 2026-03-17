import { getDraftsByResearchCardId, getResearchCardPreview, getSignals } from "@/lib/data";
import { getDirections } from "@/lib/direction-data";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";
import { getProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-data";
import { getTopicCandidates } from "@/lib/topic-candidate-data";
import { getTopics } from "@/lib/topic-data";

export async function getTodayWorkspace() {
  const [
    profile,
    directions,
    topics,
    topicCandidates,
    suggestions,
    signals,
    latestResearchCard,
  ] = await Promise.all([
    getActiveCreatorProfile(),
    getDirections(),
    getTopics(),
    getTopicCandidates(),
    getProfileUpdateSuggestions(),
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
