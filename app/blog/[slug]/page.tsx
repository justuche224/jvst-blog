import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Markdown from "@/components/markdown";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kyourblog.com";

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author || "Blog Author" }],
    publisher: "Your Blog Name",
    keywords: post.tags || [],
    category: post.category,
    openGraph: {
      type: "article",
      locale: "en_US",
      url: `${baseUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      siteName: "Your Blog Name",
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
      creator: "@yourtwitterhandle",
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
          <p className="text-muted-foreground">{formatDate(post.date)}</p>
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
                name: "Your Blog Name",
                logo: {
                  "@type": "ImageObject",
                  url: "https://yourblog.com/logo.png",
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://yourblog.com/blog/${post.slug}`,
              },
            }),
          }}
        />
      </article>
    </div>
  );
}
