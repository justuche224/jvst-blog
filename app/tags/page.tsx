import React from "react";
import Link from "next/link";
import { getAllPosts } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tag, Folder } from "lucide-react";

export const metadata = {
  title: "Tags and Categories",
  description: "Browse all tags and categories",
};

export default async function TagsPage() {
  const posts = await getAllPosts();

  // Extract and count tags
  const tagCounts = new Map<string, number>();
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
      });
    }
  });

  // Extract and count categories
  const categoryCounts = new Map<string, number>();
  posts.forEach((post) => {
    if (post.category) {
      const normalizedCategory = post.category.toLowerCase();
      categoryCounts.set(
        normalizedCategory,
        (categoryCounts.get(normalizedCategory) || 0) + 1
      );
    }
  });

  // Sort tags and categories by count (descending)
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      count,
      slug: encodeURIComponent(tag),
    }));

  const sortedCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      slug: encodeURIComponent(category),
    }));

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Tags and Categories</h1>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Categories Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Categories</h2>
          </div>

          {sortedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {sortedCategories.map((category) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {category.name}{" "}
                    <span className="ml-1 text-muted-foreground">
                      ({category.count})
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No categories found</p>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Tags</h2>
          </div>

          {sortedTags.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {sortedTags.map((tag) => (
                <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {tag.name}{" "}
                    <span className="ml-1 opacity-70">({tag.count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tags found</p>
          )}
        </div>
      </div>
    </div>
  );
}
