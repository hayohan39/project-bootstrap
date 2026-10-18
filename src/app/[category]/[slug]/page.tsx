import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { posts } from "@/content/posts";
import { getCategory, getPost, postPath, postsIn } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await props.params;
  const post = getPost(category, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: postPath(post) },
    openGraph: { type: "article", title: post.title, description: post.summary },
  };
}

export default async function PostPage(props: PageProps<"/[category]/[slug]">) {
  const { category: categorySlug, slug } = await props.params;
  const post = getPost(categorySlug, slug);
  const category = getCategory(categorySlug);
  if (!post || !category) notFound();

  const more = postsIn(category.slug).filter((p) => p.slug !== post.slug);

  return (
    <article className="post">
      <p className="whisper">
        <Link href={`/${category.slug}`}>
          <span aria-hidden="true">{category.emoji}</span> {category.label}
        </Link>
        {post.area ? <> · {post.area}</> : null}
      </p>
      <h1>{post.title}</h1>
      <p className="lead">{post.summary}</p>

      {post.body.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}

      {post.tips?.length ? (
        <aside className="tips">
          <h2>Our shy tips</h2>
          <ul>
            {post.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <p className="muted small">
        Last updated <time dateTime={post.updated}>{post.updated}</time>
      </p>

      <AdSlot name="post-bottom" />

      {more.length ? (
        <section aria-labelledby="more">
          <h2 id="more">More from {category.label}</h2>
          <div className="grid">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
