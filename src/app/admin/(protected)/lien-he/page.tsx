import { prisma } from "@/lib/db";
import { ContactStatusSelect } from "@/components/admin/ContactStatusSelect";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default async function AdminContactMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tin nhắn liên hệ</h1>
      <p className="mt-1 text-sm text-slate-500">{messages.length} tin nhắn</p>

      <div className="mt-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {[m.phone, m.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{formatDate(m.createdAt)}</span>
                <ContactStatusSelect id={m.id} status={m.status} />
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            Chưa có tin nhắn liên hệ nào.
          </div>
        )}
      </div>
    </div>
  );
}
