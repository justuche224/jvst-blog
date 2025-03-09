"use server";

import fs from "fs";
import path from "path";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

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

// Helper function to safely quote YAML values
function safeYamlValue(value: string): string {
  // If the value contains any special characters that might break YAML parsing,
  // wrap it in double quotes and escape any double quotes in the content
  if (
    value.includes(":") ||
    value.includes('"') ||
    value.includes("'") ||
    value.includes("\n") ||
    value.includes("#") ||
    value.includes("&")
  ) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

// Helper function to generate frontmatter
function generateFrontmatter(data: PostData, originalDate: string): string {
  const { title, excerpt, coverImage, author, tags, category } = data;

  // Create frontmatter with properly quoted values
  let markdown = "---\n";
  markdown += `title: ${safeYamlValue(title)}\n`;
  markdown += `date: ${originalDate}\n`;
  markdown += `updatedAt: ${new Date().toISOString()}\n`;

  if (excerpt) {
    markdown += `excerpt: ${safeYamlValue(excerpt)}\n`;
  }

  if (coverImage) {
    markdown += `coverImage: ${safeYamlValue(coverImage)}\n`;
  }

  if (author) {
    markdown += `author: ${safeYamlValue(author)}\n`;
  }

  if (category) {
    markdown += `category: ${safeYamlValue(category)}\n`;
  }

  if (tags && tags.length > 0) {
    // Format tags as a YAML array
    markdown += "tags:\n";
    tags.forEach((tag) => {
      markdown += `  - ${safeYamlValue(tag)}\n`;
    });
  }

  markdown += "---\n\n";
  return markdown;
}

export async function createPost(data: PostData): Promise<string> {
  const { title, content } = data;

  // Create slug from title
  const slug = slugify(title);

  // Generate frontmatter
  const frontmatter = generateFrontmatter(data, new Date().toISOString());

  // Combine frontmatter and content
  const markdown = frontmatter + content;

  // Ensure the directory exists
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }

  // Write the file
  const filePath = path.join(postsDirectory, `${slug}.md`);
  fs.writeFileSync(filePath, markdown);

  // Revalidate the paths
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");

  return slug;
}

export async function updatePost(
  slug: string,
  data: PostData
): Promise<string> {
  const { title, content } = data;

  // Get the original file path
  const originalFilePath = path.join(postsDirectory, `${slug}.md`);

  // Check if the file exists
  if (!fs.existsSync(originalFilePath)) {
    throw new Error(`Post with slug "${slug}" not found`);
  }

  // Read the original file to get the original date
  const originalContent = fs.readFileSync(originalFilePath, "utf8");
  const dateMatch = originalContent.match(/date: (.*?)(\n|$)/);
  const originalDate = dateMatch
    ? dateMatch[1].trim()
    : new Date().toISOString();

  // Generate new frontmatter
  const frontmatter = generateFrontmatter(data, originalDate);

  // Combine frontmatter and content
  const markdown = frontmatter + content;

  // Generate new slug if title changed
  const newSlug = slugify(title);
  const newFilePath = path.join(postsDirectory, `${newSlug}.md`);

  // Write the file to the new location
  fs.writeFileSync(newFilePath, markdown);

  // If the slug changed, delete the old file
  if (newSlug !== slug) {
    fs.unlinkSync(originalFilePath);
  }

  // Revalidate the paths
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/${newSlug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/manage");

  return newSlug;
}

export async function deletePost(slug: string): Promise<boolean> {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    // Delete the file
    fs.unlinkSync(filePath);

    // Revalidate the paths
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/manage");

    return true;
  } catch (error) {
    console.error(`Error deleting post ${slug}:`, error);
    return false;
  }
}
