import type React from "react";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import "./globals.css";

export const metadata = {
  title: "Markdown Blog",
  description: "A simple markdown blog built with Next.js",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  Markdown Blog
                </Link>
                <nav className="flex items-center gap-4">
                  <Link href="/">Home</Link>
                  <Link href="/admin">
                    <Button variant="outline">Write Post</Button>
                  </Link>
                  <ModeToggle />
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6">
              <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} Markdown Blog. All rights
                  reserved.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
