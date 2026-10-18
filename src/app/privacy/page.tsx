import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} handles your data.`,
};

// 광고(애드센스 등)를 켜기 전에 실제 사용 도구에 맞게 고쳐야 한다.
export default function PrivacyPage() {
  return (
    <article className="post">
      <h1>Privacy</h1>
      <p className="lead">Short version: we don&apos;t ask for your personal information.</p>
      <p>
        You can read everything on {site.name} without an account. We don&apos;t collect your
        name, email or location, and there are no sign-up forms.
      </p>
      <h2>Ads and cookies</h2>
      <p>
        We may show ads in the future, for example through Google AdSense. Ad partners can use
        cookies to show ads based on your visits to this and other websites. When we turn ads on,
        we will update this page with the partners we use and how to opt out.
      </p>
      <h2>Contact</h2>
      <p>Questions about this page? A contact address will be added here before launch.</p>
    </article>
  );
}
