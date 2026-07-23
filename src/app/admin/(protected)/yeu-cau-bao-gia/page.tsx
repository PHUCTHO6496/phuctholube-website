import Link from "next/link";
import { prisma } from "@/lib/db";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default async function AdminQuoteRequestsPage() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Yêu cầu báo giá</h1>
      <p className="mt-1 text-sm text-slate-500">{quotes.length} yêu cầu</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Công ty / Liên hệ</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Số sản phẩm</th>
              <th className="px-4 py-3">Ngày gửi</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{q.companyName}</p>
                  <p className="text-xs text-slate-500">{q.contactName}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{q.phone}</td>
                <td className="px-4 py-3 text-slate-600">{q._count.items}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(q.createdAt)}</td>
                <td className="px-4 py-3">
                  <QuoteStatusSelect id={q.id} status={q.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/yeu-cau-bao-gia/${q.id}`}
                    className="text-sm font-semibold text-blue-900 hover:text-amber-600"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Chưa có yêu cầu báo giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
