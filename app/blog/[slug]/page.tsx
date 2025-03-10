import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Markdown from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Folder, Tag } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // Base URL for canonical links and images
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://jvst-blog.vercel.app/";

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author || "Blog Author" }],
    publisher: "Jvst Blog",
    keywords: post.tags || [],
    category: post.category,
    openGraph: {
      type: "article",
      locale: "en_US",
      url: `${baseUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      siteName: "Jvst Blog",
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      images: [
        {
          url:
            post.coverImage ||
            `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      authors: [post.author || "Blog Author"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [
        post.coverImage ||
          `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`,
      ],
      creator: "@jvstuche",
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full py-10">
      <article className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && (
              <>
                <span>•</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap gap-3 mb-6">
            {post.category && (
              <Link
                href={`/category/${encodeURIComponent(
                  post.category.toLowerCase()
                )}`}
                className="inline-flex items-center"
              >
                <Badge variant="outline" className="gap-1 px-3 py-1 text-sm">
                  <Folder className="h-3.5 w-3.5" />
                  {post.category}
                </Badge>
              </Link>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1 px-3 py-1 text-sm"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {post.coverImage && (
          <div className="mb-8 aspect-video overflow-hidden rounded-lg">
            <img
              src={post.coverImage || "/placeholder.svg"}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="prose prose-stone dark:prose-invert max-w-none">
          <Markdown content={post.content} />
        </div>

        {/* Add structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: post.coverImage ? [post.coverImage] : [],
              datePublished: post.date,
              dateModified: post.updatedAt || post.date,
              author: {
                "@type": "Person",
                name: post.author || "Blog Author",
              },
              publisher: {
                "@type": "Organization",
                name: "Jvst Blog",
                logo: {
                  "@type": "ImageObject",
                  url: "https://jvst-blog.vercel.app/logo.png",
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://jvst-blog.vercel.app/blog/${post.slug}`,
              },
              keywords: post.tags?.join(", "),
              articleSection: post.category,
            }),
          }}
        />
      </article>
    </div>
  );
}
