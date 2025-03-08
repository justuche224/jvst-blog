import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get title from query params
    const title = searchParams.get("title") || "Blog Post";

    // Load a font
    const interSemiBold = await fetch(
      new URL(
        "https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap",
        request.url
      )
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f4f5",
            backgroundImage:
              "linear-gradient(to bottom right, #f4f4f5, #e4e4e7)",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "90%",
              height: "80%",
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontFamily: '"Inter"',
                fontWeight: 600,
                color: "#18181b",
                textAlign: "center",
                marginBottom: "20px",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 30,
                fontFamily: '"Inter"',
                color: "#71717a",
                textAlign: "center",
              }}
            >
              Your Markdown Blog
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: interSemiBold,
            style: "normal",
            weight: 600,
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
