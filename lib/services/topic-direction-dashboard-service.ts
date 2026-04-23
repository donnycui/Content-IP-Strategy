import type { CreatorProfileRow } from "@/lib/profile-data";
import type { DirectionRow } from "@/lib/direction-data";
import type { TopicRow } from "@/lib/topic-data";
import type { TopicCandidateRow } from "@/lib/topic-candidate-data";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";
import { getDirections } from "@/lib/direction-data";
import { getTopics } from "@/lib/topic-data";
import { getTopicCandidates } from "@/lib/topic-candidate-data";

export type TopicDirectionDashboardPayload = {
  profile: CreatorProfileRow;
  directions: DirectionRow[];
  topics: TopicRow[];
  topicCandidates: TopicCandidateRow[];
};

export async function getTopicDirectionDashboard(): Promise<TopicDirectionDashboardPayload> {
  const profile = (await getActiveCreatorProfile()) ?? mockCreatorProfile;

  const [directions, topics, topicCandidates] = await Promise.all([
    getDirections(profile.id),
    getTopics(profile.id),
    getTopicCandidates(profile.id),
  ]);

  return {
    profile,
    directions,
    topics,
    topicCandidates,
  };
}
