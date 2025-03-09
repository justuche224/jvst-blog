import Link from "next/link";
import { getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit } from "lucide-react";
import React from "react";
import DeletePostButton from "@/components/delete-post-button";

export const metadata = {
  title: "Manage Blog Posts",
  description: "Manage your blog posts",
};

export default async function ManagePostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Blog Posts</h1>
        <Link href="/admin">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts found</p>
          <Link href="/admin">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Author</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-medium hover:underline"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(post.date)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.author || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/edit/${post.slug}`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <DeletePostButton slug={post.slug} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
