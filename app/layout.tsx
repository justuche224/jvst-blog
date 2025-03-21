import type React from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jvst Blog",
  description: "My Persornal Tech Blog",
  keywords: ["blog", "tech", "personal", "jvstuche"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="border-b flex justify-center items-center">
              <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  Jvst Blog
                </Link>
                <nav className="flex items-center gap-4">
                  <Link href="/">Home</Link>
                  <Link href="/admin/manage">Manage</Link>
                  <Link href="/tags">Tags</Link>
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
                  &copy; {new Date().getFullYear()} Jvst Blog. All rights
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
