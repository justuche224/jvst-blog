import React from "react";
import Link from "next/link";
import { getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Folder, Tag } from "lucide-react";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="border rounded-lg overflow-hidden transition-all hover:shadow-md"
          >
            <Link href={`/blog/${post.slug}`} className="block">
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
            </Link>

            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.category && (
                  <Link
                    href={`/category/${encodeURIComponent(
                      post.category.toLowerCase()
                    )}`}
                  >
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Folder className="h-3 w-3" />
                      {post.category}
                    </Badge>
                  </Link>
                )}

                {post.tags && post.tags.length > 0 && (
                  <Link
                    href={`/tag/${encodeURIComponent(
                      post.tags[0].toLowerCase()
                    )}`}
                  >
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Tag className="h-3 w-3" />
                      {post.tags[0]}
                      {post.tags.length > 1 && (
                        <span className="ml-1">+{post.tags.length - 1}</span>
                      )}
                    </Badge>
                  </Link>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {formatDate(post.date)}
              </p>

              <Link href={`/blog/${post.slug}`} className="block group">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>

              <p className="text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
