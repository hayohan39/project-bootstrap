import type { MetadataRoute } from "next";
import { posts } from "@/content/posts";
import { postPath } from "@/lib/posts";
import { categories, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/privacy", ...categories.map((c) => `/${c.slug}`)];
  return [
    ...pages.map((path) => ({ url: `${site.url}${path}` })),
    ...posts.map((post) => ({ url: `${site.url}${postPath(post)}`, lastModified: post.updated })),
  ];
}
