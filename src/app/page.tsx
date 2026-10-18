import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { latestPosts } from "@/lib/posts";
import { categories, site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="whisper">(psst… hi)</p>
        <h1>We&apos;re a local couple in Korea, and we have a few small recommendations.</h1>
        <p className="lead">{site.description}</p>
      </section>

      <section aria-labelledby="categories">
        <h2 id="categories" className="visually-hidden">
          Categories
        </h2>
        <div className="grid">
          {categories.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="card category-card">
              <span className="emoji" aria-hidden="true">
                {c.emoji}
              </span>
              <h3>{c.title}</h3>
              <p className="muted">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot name="home-middle" />

      <section aria-labelledby="latest">
        <h2 id="latest">Our latest little notes</h2>
        <div className="grid">
          {latestPosts(9).map((post) => (
            <PostCard key={`${post.category}/${post.slug}`} post={post} showCategory />
          ))}
        </div>
      </section>
    </>
  );
}
