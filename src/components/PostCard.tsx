import Link from "next/link";
import type { Post } from "@/content/posts";
import { getCategory, postPath } from "@/lib/posts";

export function PostCard({ post, showCategory = false }: { post: Post; showCategory?: boolean }) {
  const category = getCategory(post.category);
  return (
    <Link href={postPath(post)} className="card">
      {showCategory && category ? (
        <span className="card-label">
          {category.emoji} {category.label}
        </span>
      ) : null}
      <h3>{post.title}</h3>
      <p className="muted">{post.summary}</p>
    </Link>
  );
}
