"use client";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteIndustry } from "@/lib/actions/admin-industries";

export function DeleteIndustryButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteButton
      confirmMessage={`Xóa lĩnh vực "${name}"?`}
      onDelete={() => deleteIndustry(id)}
    />
  );
}
