"use client";

import { StatusSelect } from "@/components/admin/StatusSelect";
import { updateContactStatus } from "@/lib/actions/admin-contacts";

const OPTIONS = [
  { value: "new", label: "Mới" },
  { value: "replied", label: "Đã phản hồi" },
  { value: "closed", label: "Đã đóng" },
];

export function ContactStatusSelect({ id, status }: { id: string; status: string }) {
  return <StatusSelect id={id} status={status} options={OPTIONS} onUpdate={updateContactStatus} />;
}
