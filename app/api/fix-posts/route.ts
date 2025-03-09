import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fixPostFrontmatter } from "@/lib/api";

export async function GET() {
  try {
    const postsDirectory = path.join(process.cwd(), "content/posts");

    if (!fs.existsSync(postsDirectory)) {
      return NextResponse.json({
        success: false,
        message: "Posts directory does not exist",
      });
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const results = [];

    for (const fileName of fileNames) {
      if (fileName.endsWith(".md")) {
        const slug = fileName.replace(/\.md$/, "");
        const fixed = await fixPostFrontmatter(slug);
        results.push({ slug, fixed });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${results.filter((r) => r.fixed).length} of ${
        results.length
      } posts`,
      results,
    });
  } catch (error) {
    console.error("Error fixing posts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fixing posts",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
