"use client";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/lib/actions/admin-products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteButton
      confirmMessage={`Xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`}
      onDelete={() => deleteProduct(id)}
    />
  );
}
