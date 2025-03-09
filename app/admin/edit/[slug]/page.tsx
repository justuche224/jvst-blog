import React from "react";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/api";
import EditPostForm from "@/components/edit-post-form";

interface EditPostPageProps {
  params: {
    slug: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
        <EditPostForm post={post} />
      </div>
    </div>
  );
}
