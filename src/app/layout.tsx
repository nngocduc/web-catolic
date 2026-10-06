import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "祈りのとも | Nhật–Việt", template: "%s | 祈りのとも" },
  description: "日本語とベトナム語で、ミサと祈りに親しむための小さなカトリックアプリ。現在はサンプル版です。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main-content">本文へ移動</a>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand">祈りのとも <span lang="vi">Nhật–Việt</span></Link>
            <Navigation />
          </div>
        </header>
        <main id="main-content" className="main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">日本語とベトナム語で、祈りをともに。<span lang="vi">Cùng cầu nguyện bằng tiếng Nhật và tiếng Việt.</span></footer>
      </body>
    </html>
  );
}
