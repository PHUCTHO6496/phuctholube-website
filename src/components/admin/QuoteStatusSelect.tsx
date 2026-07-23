"use client";

import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateQuoteStatus } from "@/lib/actions/admin-quotes";

const OPTIONS = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "closed", label: "Đã đóng" },
];

export function QuoteStatusSelect({ id, status }: { id: string; status: string }) {
  return <StatusSelect id={id} status={status} options={OPTIONS} onUpdate={updateQuoteStatus} />;
}
