"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  confirmMessage,
  onDelete,
  className,
}: {
  confirmMessage: string;
  onDelete: () => Promise<{ ok: boolean }>;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(async () => {
      await onDelete();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={className ?? "ml-3 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"}
    >
      {pending ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
