import { getDraftsByResearchCardId, getResearchCardPreview, getSignals } from "@/lib/data";
import { getDirections } from "@/lib/direction-data";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";
import { getProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-data";
import { getTopicCandidates } from "@/lib/topic-candidate-data";
import { getTopics } from "@/lib/topic-data";

export async function getHomepageSummaryData() {
  const [profile, topicCandidates] = await Promise.all([
    getActiveCreatorProfile(),
    getTopicCandidates(),
  ]);

  const activeProfile = profile ?? mockCreatorProfile;

  return {
    directionsCount: activeProfile.directionsCount,
    topicsCount: activeProfile.topicsCount,
    topicCandidatesCount: topicCandidates.length,
    pendingSuggestionsCount: activeProfile.pendingSuggestionsCount,
  };
}

export async function getHomepageProfileDirectionsData() {
  const profile = (await getActiveCreatorProfile()) ?? mockCreatorProfile;
  const directions = await getDirections(profile.id);

  return {
    profile,
    directions: directions.slice(0, 3),
  };
}

export async function getHomepageTopicsCandidatesData() {
  const [topics, topicCandidates] = await Promise.all([
    getTopics(),
    getTopicCandidates(),
  ]);

  return {
    topics: topics.slice(0, 4),
    topicCandidates: topicCandidates
      .filter((candidate) => candidate.status === "NEW" || candidate.status === "KEPT")
      .slice(0, 4),
  };
}

export async function getHomepageEvolutionOutputData() {
  const [pendingSuggestions, signals, latestResearchCard, topicCandidates] = await Promise.all([
    getProfileUpdateSuggestions(),
    getSignals(),
    getResearchCardPreview(),
    getTopicCandidates(),
  ]);

  const latestResearchCardId = latestResearchCard && "id" in latestResearchCard ? latestResearchCard.id : null;
  const latestDrafts = latestResearchCardId ? await getDraftsByResearchCardId(latestResearchCardId) : [];

  return {
    pendingSuggestions: pendingSuggestions.filter((suggestion) => suggestion.status === "PENDING").slice(0, 3),
    signals: {
      newSignals: signals.filter((signal) => signal.status === "NEW").slice(0, 4),
      total: signals.length,
    },
    keptRecommendationsCount: topicCandidates.filter((candidate) => candidate.status === "KEPT").length,
    output: latestResearchCard
      ? {
          latestResearchCard,
          latestResearchCardId,
          latestDraftsCount: latestDrafts.length,
        }
      : null,
  };
}
