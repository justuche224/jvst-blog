"use server";

import fs from "fs";
import path from "path";
import { slugify } from "@/lib/utils";

const postsDirectory = path.join(process.cwd(), "content/posts");

interface PostData {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author?: string;
  tags?: string[];
  category?: string;
}

export async function createPost(data: PostData): Promise<string> {
  const { title, excerpt, content, coverImage, author, tags, category } = data;

  // Create slug from title
  const slug = slugify(title);

  // Create frontmatter
  const frontmatter = {
    title,
    date: new Date().toISOString(),
    excerpt,
    ...(coverImage && { coverImage }),
    ...(author && { author }),
    ...(tags && { tags }),
    ...(category && { category }),
  };

  // Create markdown content with frontmatter
  const markdown = `---
title: ${frontmatter.title}
date: ${frontmatter.date}
excerpt: ${frontmatter.excerpt || ""}
${coverImage ? `coverImage: ${coverImage}` : ""}
${author ? `author: ${author}` : ""}
${tags ? `tags: [${tags.join(", ")}]` : ""}
${category ? `category: ${category}` : ""}
---

${content}`;

  // Ensure the directory exists
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }

  // Write the file
  const filePath = path.join(postsDirectory, `${slug}.md`);
  fs.writeFileSync(filePath, markdown);

  return slug;
}
