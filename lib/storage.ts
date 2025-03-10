import fs from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob"; // Remove 'get' from import
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

// Ensure the posts directory exists in development
if (process.env.NODE_ENV === "development") {
  try {
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }
  } catch (error) {
    console.error("Failed to create posts directory", error);
  }
}

const isProduction = process.env.NODE_ENV === "production";

// Helper function to get all post filenames
export async function getPostFilenames(): Promise<string[]> {
  if (!isProduction) {
    try {
      const { blobs } = await list({ prefix: "posts/" });
      console.log("file names");
      console.log(blobs);
      const blobsData = blobs.map((blob) =>
        blob.pathname.replace("posts/", "")
      );
      console.log("data");
      console.log(blobsData);
      return blobsData;
    } catch (error) {
      console.error("Error listing blobs:", error);
      return [];
    }
  } else {
    try {
      if (!fs.existsSync(postsDirectory)) {
        return [];
      }
      return fs
        .readdirSync(postsDirectory)
        .filter((file) => file.endsWith(".md"));
    } catch (error) {
      console.error("Error reading posts directory:", error);
      return [];
    }
  }
}

// Helper function to read a post file
export async function readPostFile(filename: string): Promise<string> {
  if (!isProduction) {
    try {
      // List all blobs under 'posts/'
      const { blobs } = await list({ prefix: "posts/" });
      // Find the blob with the exact pathname
      const blob = blobs.find((b) => b.pathname === `posts/${filename}`);
      if (!blob) {
        throw new Error(`Post file not found: ${filename}`);
      }
      // Fetch the content using the downloadUrl
      const response = await fetch(blob.downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${filename}`);
      }
      const content = await response.text();
      return content;
    } catch (error) {
      console.error(`Error reading blob: ${filename}`, error);
      throw error;
    }
  } else {
    try {
      const filePath = path.join(postsDirectory, filename);
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.error(`Error reading file: ${filename}`, error);
      throw error;
    }
  }
}

// Helper function to write a post file
export async function writePostFile(
  filename: string,
  content: string
): Promise<void> {
  if (!isProduction) {
    try {
      const data = await put(`posts/${filename}`, content, {
        contentType: "text/markdown",
        access: "public",
      });
      console.log("data");
      console.log(data);
    } catch (error) {
      console.error(`Error writing blob: ${filename}`, error);
      throw error;
    }
  } else {
    try {
      const filePath = path.join(postsDirectory, filename);
      fs.writeFileSync(filePath, content);
    } catch (error) {
      console.error(`Error writing file: ${filename}`, error);
      throw error;
    }
  }
}

// Helper function to delete a post file
export async function deletePostFile(filename: string): Promise<void> {
  if (!isProduction) {
    try {
      await del(`posts/${filename}`);
    } catch (error) {
      console.error(`Error deleting blob: ${filename}`, error);
      throw error;
    }
  } else {
    try {
      const filePath = path.join(postsDirectory, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file: ${filename}`, error);
      throw error;
    }
  }
}

// Helper function to parse frontmatter
export function parseFrontmatter(content: string) {
  try {
    return matter(content);
  } catch (error) {
    console.error("Error parsing frontmatter:", error);
    return {
      data: {},
      content: content.replace(/---[\s\S]*?---/, "").trim(),
    };
  }
}
