import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About us",
  description: "Who we are, and why we only recommend places we actually go to.",
};

export default function AboutPage() {
  return (
    <article className="post">
      <p className="whisper">(hello, it&apos;s us)</p>
      <h1>About us</h1>
      <p className="lead">
        We&apos;re a married couple who live in Korea. We are not very loud people, so this site is
        our quiet way of saying: if you&apos;re visiting, maybe try this.
      </p>
      <p>
        Everything here is somewhere we go, something we buy, or a habit we actually have. We
        don&apos;t write about places we haven&apos;t been, and we&apos;ll tell you when something
        is a little overrated.
      </p>
      <p>
        Some pages may show ads in the future. That helps us keep the site running. If we ever
        get paid to recommend something, we will say so clearly on that page.
      </p>
    </article>
  );
}
