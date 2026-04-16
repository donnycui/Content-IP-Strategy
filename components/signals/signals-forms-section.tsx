import { SignalCreateForm } from "@/components/signal-create-form";
import { UrlIngestForm } from "@/components/url-ingest-form";
import { getSources } from "@/lib/source-data";

export async function SignalsFormsSection() {
  const sources = await getSources();

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr,1fr]">
      <UrlIngestForm sources={sources} />
      <SignalCreateForm sources={sources} />
    </section>
  );
}
