import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Folder } from "lucide-react";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const decodedCategory = decodeURIComponent(params.category);
  const formattedCategory =
    decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

  return {
    title: `Posts in category "${formattedCategory}"`,
    description: `Browse all blog posts in the ${formattedCategory} category`,
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const categories = new Set<string>();

  posts.forEach((post) => {
    if (post.category) {
      categories.add(post.category.toLowerCase());
    }
  });

  return Array.from(categories).map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const decodedCategory = decodeURIComponent(params.category);
  const formattedCategory =
    decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

  const allPosts = await getAllPosts();
  const posts = allPosts.filter(
    (post) => post.category?.toLowerCase() === decodedCategory.toLowerCase()
  );

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Folder className="h-5 w-5" />
          <h1 className="text-3xl font-bold">{formattedCategory}</h1>
        </div>
        <p className="text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"} in the &quot;
          {formattedCategory}&quot; category
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
