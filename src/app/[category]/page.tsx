import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { PostCard } from "@/components/PostCard";
import { getCategory, postsIn } from "@/lib/posts";
import { categories } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps<"/[category]">): Promise<Metadata> {
  const category = getCategory((await props.params).category);
  return category ? { title: category.title, description: category.blurb } : {};
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const category = getCategory((await props.params).category);
  if (!category) notFound();

  return (
    <>
      <header className="page-header">
        <p className="whisper">
          <span aria-hidden="true">{category.emoji}</span> {category.label}
        </p>
        <h1>{category.title}</h1>
        <p className="lead">{category.blurb}</p>
      </header>
      <div className="grid">
        {postsIn(category.slug).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <AdSlot name="category-bottom" />
    </>
  );
}
