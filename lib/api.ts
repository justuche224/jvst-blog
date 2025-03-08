import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

// Ensure the posts directory exists
try {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create posts directory", error);
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  content: string;
  author?: string;
  tags?: string[];
  category?: string;
  updatedAt?: string;
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    // Get all markdown files from the posts directory
    const fileNames = fs.readdirSync(postsDirectory);

    const posts = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        // Remove ".md" from file name to get slug
        const slug = fileName.replace(/\.md$/, "");

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // Use gray-matter to parse the post metadata section
        const { data, content } = matter(fileContents);

        // Validate and format the data
        const post: Post = {
          slug,
          title: data.title || "Untitled",
          date: data.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString(),
          excerpt: data.excerpt || "",
          coverImage: data.coverImage || undefined,
          content,
          author: data.author,
          tags: data.tags,
          category: data.category,
          updatedAt: data.updatedAt
            ? new Date(data.updatedAt).toISOString()
            : undefined,
        };

        return post;
      });

    // Sort posts by date in descending order
    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error getting all posts", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      excerpt: data.excerpt || "",
      coverImage: data.coverImage || undefined,
      content,
      author: data.author,
      tags: data.tags,
      category: data.category,
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt).toISOString()
        : undefined,
    };
  } catch (error) {
    console.error(`Error getting post by slug: ${slug}`, error);
    return null;
  }
}
