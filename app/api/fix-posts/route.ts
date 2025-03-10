import { NextResponse } from "next/server";
import { getPostFilenames, readPostFile, writePostFile } from "@/lib/storage";

export async function GET() {
  try {
    const fileNames = await getPostFilenames();
    const results = [];

    for (const fileName of fileNames) {
      if (fileName.endsWith(".md")) {
        const slug = fileName.replace(/\.md$/, "");
        try {
          const fileContents = await readPostFile(fileName);

          // Try to extract the content and problematic frontmatter
          const contentMatch = fileContents.match(
            /---\n([\s\S]*?)\n---\n([\s\S]*)/
          );

          if (!contentMatch) {
            results.push({
              slug,
              fixed: false,
              reason: "No frontmatter found",
            });
            continue;
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
          await writePostFile(fileName, fixedFileContents);

          results.push({ slug, fixed: true });
        } catch (error) {
          console.error(`Error fixing frontmatter for ${slug}:`, error);
          results.push({ slug, fixed: false, reason: error.message });
        }
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
        error: error.message,
      },
      { status: 500 }
    );
  }
}
