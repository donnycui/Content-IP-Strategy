import Link from "next/link";
import type { DemoStep } from "@/lib/demo/demo-playbook-logic";

export function DemoStepCard({
  index,
  step,
}: {
  index: number;
  step: DemoStep;
}) {
  return (
    <section className="panel px-6 py-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill pill-active">Step {index + 1}</span>
          <span className="pill">{step.state}</span>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-slate-800">{step.title}</p>
          <p className="muted text-sm leading-7">{step.description}</p>
        </div>
        {step.details.length ? (
          <div className="subpanel px-4 py-4">
            <div className="space-y-2 text-sm leading-7 text-slate-700">
              {step.details.map((item) => (
                <p key={item}>- {item}</p>
              ))}
            </div>
          </div>
        ) : null}
        <div>
          <Link
            className="rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white"
            href={step.href}
          >
            打开这一步
          </Link>
        </div>
      </div>
    </section>
  );
}
