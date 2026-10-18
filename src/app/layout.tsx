import type { Metadata } from "next";
import Link from "next/link";
import { categories, site } from "@/lib/site";
import "./globals.css";

// next/font/google 은 빌드 때 Google 에서 폰트를 받아온다. 네트워크가 막힌
// 환경(Claude 클라우드 세션 등)에서는 빌드가 깨지므로 시스템 폰트를 쓴다.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="logo">
              shy kind korean couple <span aria-hidden="true">🙈</span>
            </Link>
            <nav aria-label="Main">
              {categories.map((c) => (
                <Link key={c.slug} href={`/${c.slug}`}>
                  {c.label}
                </Link>
              ))}
              <Link href="/about">About us</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              Made quietly in Korea by two locals. <Link href="/about">About us</Link> ·{" "}
              <Link href="/privacy">Privacy</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
