"use client";

import type React from "react";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "@/components/markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="border rounded-md">
      <Tabs defaultValue="write" onValueChange={setActiveTab}>
        <div className="border-b px-3">
          <TabsList className="h-10 bg-transparent">
            <TabsTrigger
              value="write"
              className="data-[state=active]:bg-transparent"
            >
              Write
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-transparent"
            >
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="p-0 mt-0">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder="Write your content in markdown..."
            className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none resize-none"
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4 mt-0 min-h-[300px]">
          {value ? (
            <Markdown content={value} />
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
