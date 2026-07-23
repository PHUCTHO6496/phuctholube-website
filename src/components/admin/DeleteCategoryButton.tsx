"use client";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCategory } from "@/lib/actions/admin-categories";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteButton
      confirmMessage={`Xóa danh mục "${name}"? Sản phẩm thuộc danh mục này sẽ không còn danh mục.`}
      onDelete={() => deleteCategory(id)}
    />
  );
}
