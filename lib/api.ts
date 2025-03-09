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
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    const posts = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        // Remove ".md" from file name to get slug
        const slug = fileName.replace(/\.md$/, "");

        try {
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
        } catch (error) {
          console.error(`Error parsing post ${fileName}:`, error);
          // Return a placeholder post for files that can't be parsed
          return {
            slug,
            title: `Error: Could not parse ${fileName}`,
            date: new Date().toISOString(),
            excerpt: "This post could not be loaded due to a formatting error.",
            content:
              "This post could not be loaded due to a formatting error in the frontmatter.",
          };
        }
      });

    // Filter out any null values from posts that couldn't be parsed
    const validPosts = posts.filter((post) => post !== null);

    // Sort posts by date in descending order
    return validPosts.sort(
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

    try {
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
      console.error(`Error parsing frontmatter for ${slug}:`, error);

      // Try to extract content even if frontmatter parsing fails
      const contentMatch = fileContents.match(
        /---\n([\s\S]*?)\n---\n([\s\S]*)/
      );
      const extractedContent = contentMatch
        ? contentMatch[2]
        : "Content could not be extracted.";

      return {
        slug,
        title: `Error: Could not parse frontmatter for ${slug}`,
        date: new Date().toISOString(),
        excerpt:
          "This post could not be loaded properly due to a formatting error.",
        content: extractedContent,
      };
    }
  } catch (error) {
    console.error(`Error getting post by slug: ${slug}`, error);
    return null;
  }
}

// Function to fix existing posts with problematic frontmatter
export async function fixPostFrontmatter(slug: string): Promise<boolean> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return false;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Try to extract the content and problematic frontmatter
    const contentMatch = fileContents.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);

    if (!contentMatch) {
      return false;
    }

    const frontmatterText = contentMatch[1];
    const content = contentMatch[2];

    // Parse frontmatter line by line to handle special characters
    const frontmatterLines = frontmatterText.split("\n");
    const fixedFrontmatterLines = frontmatterLines.map((line) => {
      if (line.includes(":")) {
        const [key, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();

        // Quote the value if it contains special characters
        if (
          value.includes(":") ||
          value.includes('"') ||
          value.includes("'") ||
          value.includes("\n") ||
          value.includes("#")
        ) {
          return `${key}: "${value.replace(/"/g, '\\"')}"`;
        }
      }
      return line;
    });

    // Reconstruct the file
    const fixedFileContents = `---\n${fixedFrontmatterLines.join(
      "\n"
    )}\n---\n${content}`;

    // Write the fixed file
    fs.writeFileSync(fullPath, fixedFileContents);

    return true;
  } catch (error) {
    console.error(`Error fixing frontmatter for ${slug}:`, error);
    return false;
  }
}
