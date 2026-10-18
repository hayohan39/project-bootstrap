import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <p className="whisper">(oh no…)</p>
      <h1>We couldn&apos;t find that page.</h1>
      <p className="lead">
        Sorry. Maybe it moved, or we haven&apos;t written it yet. <Link href="/">Go back home</Link>
      </p>
    </section>
  );
}
