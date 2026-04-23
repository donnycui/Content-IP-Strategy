import Link from "next/link";
import { getActiveCreatorProfile, mockCreatorProfile } from "@/lib/profile-data";
import type { CreatorProfileRow } from "@/lib/profile-data";

export async function TopicsProfileSection(props?: { profile?: CreatorProfileRow }) {
  const profile = props?.profile ?? (await getActiveCreatorProfile()) ?? mockCreatorProfile;

  return (
    <section className="panel px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="metric-label">当前画像锚点</p>
          <p className="text-lg font-semibold">{profile.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/agents/creator-profile">
            查看创作者画像
          </Link>
          <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href="/agents/style-content">
            推进到内容层
          </Link>
        </div>
      </div>
      <p className="muted mt-3 text-sm leading-7">{profile.positioning}</p>
    </section>
  );
}
