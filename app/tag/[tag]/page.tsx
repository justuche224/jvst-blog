import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const formattedTag = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1);

  return {
    title: `Posts tagged with "${formattedTag}"`,
    description: `Browse all blog posts tagged with ${formattedTag}`,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const tags = new Set<string>();

  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tags.add(tag.toLowerCase());
      });
    }
  });

  return Array.from(tags).map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const formattedTag = decodedTag.charAt(0).toUpperCase() + decodedTag.slice(1);

  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) =>
    post.tags?.some((tag) => tag.toLowerCase() === decodedTag.toLowerCase())
  );

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-5 w-5" />
          <h1 className="text-3xl font-bold">{formattedTag}</h1>
        </div>
        <p className="text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"} tagged with
          &quot;{formattedTag}&quot;
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <div className="border rounded-lg overflow-hidden transition-all group-hover:shadow-md">
              <div className="aspect-video bg-muted relative">
                {post.coverImage ? (
                  <img
                    src={post.coverImage || "/placeholder.svg"}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                    <span className="text-muted-foreground">
                      No cover image
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {formatDate(post.date)}
                </p>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
