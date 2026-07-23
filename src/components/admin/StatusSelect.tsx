"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  closed: "bg-slate-100 text-slate-500",
  replied: "bg-blue-50 text-blue-700",
};

export function StatusSelect({
  id,
  status,
  options,
  onUpdate,
}: {
  id: string;
  status: string;
  options: { value: string; label: string }[];
  onUpdate: (id: string, status: string) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      await onUpdate(id, value);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className={cn(
        "rounded-full border-0 px-2.5 py-1 text-xs font-semibold focus:outline-none",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
