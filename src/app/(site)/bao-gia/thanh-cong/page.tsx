import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Gửi yêu cầu báo giá thành công",
};

export default function QuoteSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
        Gửi yêu cầu báo giá thành công!
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Cảm ơn bạn đã quan tâm đến sản phẩm của {SITE.name}. Đội ngũ kinh
        doanh sẽ liên hệ với bạn trong thời gian sớm nhất để tư vấn và báo
        giá chi tiết. Nếu cần hỗ trợ gấp, vui lòng gọi{" "}
        <a href={`tel:${SITE.phone}`} className="font-semibold text-blue-900">
          {SITE.phoneDisplay}
        </a>
        .
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
