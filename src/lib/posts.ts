import { posts, type Post } from "@/content/posts";
import { categories, type Category } from "@/lib/site";

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function postsIn(category: string): Post[] {
  return posts.filter((p) => p.category === category);
}

export function getPost(category: string, slug: string): Post | undefined {
  return posts.find((p) => p.category === category && p.slug === slug);
}

export function latestPosts(limit: number): Post[] {
  return [...posts].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, limit);
}

export function postPath(post: Post): string {
  return `/${post.category}/${post.slug}`;
}
