import React from "react";
import Link from "next/link";
import { getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
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
