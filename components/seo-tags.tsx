import React from "react";
import Head from "next/head";

interface SEOTagsProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  twitterCard?: "summary" | "summary_large_image";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  category?: string;
}

export default function SEOTags({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  publishedTime,
  modifiedTime,
  author,
  tags,
  category,
}: SEOTagsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourblog.com";
  const fullCanonicalUrl = canonicalUrl
    ? `${baseUrl}${canonicalUrl}`
    : undefined;
  const fullOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${baseUrl}${ogImage}`
    : undefined;

  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {fullCanonicalUrl && (
        <meta property="og:url" content={fullCanonicalUrl} />
      )}
      <meta property="og:type" content={ogType} />
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      <meta property="og:site_name" content="Your Blog Name" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}
      <meta name="twitter:site" content="@yourtwitterhandle" />

      {/* Article specific (for blog posts) */}
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {ogType === "article" && category && (
        <meta property="article:section" content={category} />
      )}
      {ogType === "article" &&
        tags &&
        tags.length > 0 &&
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
    </Head>
  );
}
