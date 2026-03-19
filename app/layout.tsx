import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "内容研究工作台",
  description: "用于宏观叙事内容工作流的信号扫描、研究卡整理与内容草稿生成后台。",
};

const navItems = [
  { href: "/", label: "今日工作台" },
  { href: "/profile/extract", label: "IP 提炼" },
  { href: "/profile", label: "创作者画像" },
  { href: "/evolution", label: "进化建议" },
  { href: "/directions", label: "方向台" },
  { href: "/topics", label: "主题台" },
  { href: "/signals", label: "信号流" },
  { href: "/candidates", label: "选题台" },
  { href: "/reviews", label: "校准台" },
  { href: "/sources", label: "信号源" },
  { href: "/admin/gateways", label: "模型管理" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="shell">
          <div className="frame space-y-6">
            <header className="panel flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="section-kicker">内容 IP 研究工作台</p>
                <div>
                  <h1 className="text-[28px] font-semibold leading-tight">信号、判断、站位。</h1>
                  <p className="muted mt-2 max-w-2xl text-sm leading-7">
                    一个轻量的编辑工作台，把广覆盖信号采集压缩成研究卡与可直接发布的内容草稿。
                  </p>
                </div>
              </div>
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <Link className="pill transition hover:border-sky-400 hover:text-slate-800" href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
