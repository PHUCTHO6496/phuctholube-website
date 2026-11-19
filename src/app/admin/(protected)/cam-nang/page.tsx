import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { formatPhoneDisplay } from "@/lib/format";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  sent: { label: "Đã gửi", className: "bg-green-50 text-green-700" },
  failed: { label: "Gửi lỗi — cần gửi tay", className: "bg-red-50 text-red-700" },
  pending: { label: "Đang gửi", className: "bg-slate-100 text-slate-600" },
};

export default async function AdminGuideLeadsPage() {
  const [leads, settings] = await Promise.all([
    prisma.guideLead.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Khách nhận cẩm nang</h1>
      <p className="mt-1 text-sm text-slate-500">
        {leads.length} khách đã để lại thông tin để nhận cẩm nang dầu nhớt.
      </p>

      {!settings.leadGuidePdfUrl && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Ô mời nhận cẩm nang đang <strong>tắt</strong> vì chưa có file PDF. Tải file lên ở{" "}
          <Link href="/admin/cai-dat" className="font-semibold underline">
            Cài đặt → Cẩm nang tặng khách
          </Link>{" "}
          để bật.
        </div>
      )}

      {leads.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          Chưa có khách nào đăng ký nhận cẩm nang.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Điện thoại</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Thời gian</th>
                <th className="px-4 py-3 font-semibold">Gửi cẩm nang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => {
                const badge = STATUS_BADGE[lead.emailStatus] ?? STATUS_BADGE.pending;
                return (
                  <tr key={lead.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      {lead.company && <p className="text-xs text-slate-500">{lead.company}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a
                        href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                        className="text-blue-900 hover:underline"
                      >
                        {formatPhoneDisplay(lead.phone)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${lead.email}`} className="text-blue-900 hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
