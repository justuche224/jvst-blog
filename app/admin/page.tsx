"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import MarkdownEditor from "@/components/markdown-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ListFilter } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    coverImage: "",
    content: "",
    author: "",
    tags: "",
    category: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null); // Clear error when user makes changes
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
    setFormError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: "Missing fields",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const slug = await createPost({
        title: formData.title,
        excerpt: formData.excerpt,
        coverImage: formData.coverImage,
        content: formData.content,
        author: formData.author || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : undefined,
        category: formData.category || undefined,
      });

      toast({
        title: "Success!",
        description: "Your post has been published",
      });

      router.push(`/blog/${slug}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof Error) {
        setFormError(
          error.message || "Failed to create post. Please try again."
        );
      } else {
        setFormError("Failed to create post. Please try again.");
      }
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <Link href="/admin/manage">
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Manage Posts
            </Button>
          </Link>
        </div>

        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Post title"
              required
            />
            <p className="text-xs text-muted-foreground">
              Special characters like colons (:) are allowed and will be
              properly escaped.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief description of your post"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
            <Input
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author (optional)</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Technology"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated, optional)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. nextjs, react, markdown"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <MarkdownEditor
              value={formData.content}
              onChange={handleContentChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </div>
    </div>
  );
}
