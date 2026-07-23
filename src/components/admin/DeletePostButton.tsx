"use client";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePost } from "@/lib/actions/admin-posts";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <DeleteButton
      confirmMessage={`Xóa bài viết "${title}"? Hành động này không thể hoàn tác.`}
      onDelete={() => deletePost(id)}
    />
  );
}
