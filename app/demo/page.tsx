import { DemoStepCard } from "@/components/demo/demo-step-card";
import { getDemoPlaybook } from "@/lib/services/demo-playbook-service";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const playbook = await getDemoPlaybook();

  return (
    <main className="space-y-5">
      <section className="panel px-6 py-6">
        <div className="space-y-2">
          <p className="section-kicker">Demo Path</p>
          <h1 className="section-title">{playbook.headline}</h1>
          <p className="section-desc">{playbook.summary}</p>
        </div>
      </section>

      <section className="grid gap-4">
        {playbook.steps.map((step, index) => (
          <DemoStepCard index={index} key={`${index}-${step.title}`} step={step} />
        ))}
      </section>
    </main>
  );
}
