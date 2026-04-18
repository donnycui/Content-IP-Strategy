import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "zhaocai-IP-center",
  description: "一个阶段化多 Agent 创作者中枢，帮助创作者完成 IP 提炼、画像固化、选题方向、内容生产与复盘进化。",
};

const navItems = [
  { href: "/", label: "中枢首页" },
  { href: "/profile/extract", label: "IP 提炼" },
  { href: "/profile", label: "创作者画像" },
  {
    href: "/directions",
    label: "方向与选题",
    matchers: ["/directions", "/topics", "/candidates"],
  },
  { href: "/evolution", label: "升级进化" },
  {
    href: "/signals",
    label: "信号研究",
    matchers: ["/signals", "/reviews", "/sources"],
  },
  {
    href: "/admin/gateways",
    label: "模型路由",
    matchers: ["/admin/gateways", "/admin/models", "/admin/routing"],
  },
  { href: "/admin/plans", label: "套餐权限" },
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
                <p className="section-kicker">zhaocai-IP-center</p>
                <div>
                  <h1 className="text-[28px] font-semibold leading-tight">先判断你在哪，再把你推到下一步。</h1>
                  <p className="muted mt-2 max-w-2xl text-sm leading-7">
                    一个以创作者本人为核心的多 Agent 中枢，把 IP 提炼、画像、选题、风格、内容、复盘和进化串成同一条持续运行的路径。
                  </p>
                </div>
              </div>
              <TopNav items={navItems} />
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
