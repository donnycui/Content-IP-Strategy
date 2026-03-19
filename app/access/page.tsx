import { AccessGateForm } from "@/components/access-gate-form";

export const dynamic = "force-dynamic";

export default function AccessPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 pt-16">
      <section className="panel px-8 py-8">
        <div className="space-y-3">
          <p className="section-kicker">Staging Access</p>
          <h2 className="section-title mt-2">当前环境受访问保护</h2>
          <p className="section-desc mt-3">
            这是试运行环境。请输入访问口令后再进入系统。验证成功后，系统会在当前浏览器写入一个短期访问凭证。
          </p>
        </div>
      </section>
      <AccessGateForm />
    </main>
  );
}
