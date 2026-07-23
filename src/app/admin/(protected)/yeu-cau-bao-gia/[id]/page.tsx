import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { QuoteStatusSelect } from "@/components/admin/QuoteStatusSelect";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(date);
}

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!quote) notFound();

  return (
    <div>
      <Link
        href="/admin/yeu-cau-bao-gia"
        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-amber-600"
      >
        <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{quote.companyName}</h1>
        <QuoteStatusSelect id={quote.id} status={quote.status} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Gửi lúc {formatDate(quote.createdAt)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Thông tin liên hệ
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Người liên hệ</dt>
              <dd className="font-medium text-slate-900">{quote.contactName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Số điện thoại</dt>
              <dd className="font-medium text-slate-900">
                <a href={`tel:${quote.phone}`} className="hover:text-blue-900">
                  {quote.phone}
                </a>
              </dd>
            </div>
            {quote.email && (
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">
                  <a href={`mailto:${quote.email}`} className="hover:text-blue-900">
                    {quote.email}
                  </a>
                </dd>
              </div>
            )}
            {quote.address && (
              <div>
                <dt className="text-slate-500">Địa chỉ giao hàng</dt>
                <dd className="font-medium text-slate-900">{quote.address}</dd>
              </div>
            )}
            {quote.note && (
              <div>
                <dt className="text-slate-500">Ghi chú</dt>
                <dd className="font-medium text-slate-900">{quote.note}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sản phẩm yêu cầu báo giá
          </h2>
          <div className="mt-4 divide-y divide-slate-100">
            {quote.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                <p className="text-sm text-slate-500">SL: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
