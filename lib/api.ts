import { getPostFilenames, readPostFile, parseFrontmatter } from "./storage";

// Define the expected structure of the frontmatter
interface Frontmatter {
  title?: string;
  date?: string | Date;
  excerpt?: string;
  coverImage?: string;
  author?: string;
  tags?: string[];
  category?: string;
  updatedAt?: string | Date;
}

// Define the Post interface
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
    // Get all markdown files
    const fileNames = await getPostFilenames();

    const postsPromises = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");

        try {
          const fileContents = await readPostFile(fileName);
          const { data, content } = parseFrontmatter(fileContents);

          // Type assertion for frontmatter data
          const frontmatter = data as Frontmatter;

          const post: Post = {
            slug,
            title: frontmatter.title || "Untitled",
            date: frontmatter.date
              ? new Date(frontmatter.date).toISOString()
              : new Date().toISOString(),
            excerpt: frontmatter.excerpt || "",
            coverImage: frontmatter.coverImage,
            content,
            author: frontmatter.author,
            tags: frontmatter.tags,
            category: frontmatter.category,
            updatedAt: frontmatter.updatedAt
              ? new Date(frontmatter.updatedAt).toISOString()
              : undefined,
          };

          return post;
        } catch (error) {
          console.error(`Error parsing post ${fileName}:`, error);
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

    const posts = await Promise.all(postsPromises);
    const validPosts = posts.filter((post) => post !== null) as Post[];

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
    const fileName = `${slug}.md`;
    const fileContents = await readPostFile(fileName);
    const { data, content } = parseFrontmatter(fileContents);

    // Type assertion for frontmatter data
    const frontmatter = data as Frontmatter;

    return {
      slug,
      title: frontmatter.title || "Untitled",
      date: frontmatter.date
        ? new Date(frontmatter.date).toISOString()
        : new Date().toISOString(),
      excerpt: frontmatter.excerpt || "",
      coverImage: frontmatter.coverImage,
      content,
      author: frontmatter.author,
      tags: frontmatter.tags,
      category: frontmatter.category,
      updatedAt: frontmatter.updatedAt
        ? new Date(frontmatter.updatedAt).toISOString()
        : undefined,
    };
  } catch (error) {
    console.error(`Error getting post by slug: ${slug}`, error);

    // Handle case where file exists but frontmatter parsing fails
    if (typeof error === "object" && error !== null && "message" in error) {
      const fileName = `${slug}.md`;
      try {
        const fileContents = await readPostFile(fileName);
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
      } catch (readError) {
        console.error(`File not found or unreadable: ${fileName}`, readError);
        return null;
      }
    }
    return null;
  }
}
