import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { posts } from "@/content/posts";
import { getPost, latestPosts, postPath, postsIn } from "@/lib/posts";
import { categories } from "@/lib/site";

describe("posts", () => {
  it("every post belongs to a known category and has a unique path", () => {
    const known = new Set<string>(categories.map((c) => c.slug));
    const paths = posts.map(postPath);
    for (const post of posts) expect(known.has(post.category), post.slug).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every category has at least one post", () => {
    for (const c of categories) expect(postsIn(c.slug).length, c.slug).toBeGreaterThan(0);
  });

  it("finds a post only under its own category", () => {
    const post = posts[0];
    expect(getPost(post.category, post.slug)).toBe(post);
    const other = categories.find((c) => c.slug !== post.category)!;
    expect(getPost(other.slug, post.slug)).toBeUndefined();
  });

  it("latestPosts sorts by updated date, newest first", () => {
    const latest = latestPosts(posts.length);
    for (let i = 1; i < latest.length; i++) {
      expect(latest[i - 1].updated >= latest[i].updated).toBe(true);
    }
    expect(latestPosts(2)).toHaveLength(2);
  });

  it("sitemap lists every post", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const post of posts) expect(urls.some((u) => u.endsWith(postPath(post)))).toBe(true);
  });
});
