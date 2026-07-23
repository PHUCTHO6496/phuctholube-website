import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [
    productCount,
    categoryCount,
    industryCount,
    postCount,
    newQuoteCount,
    newContactCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productCategory.count(),
    prisma.industry.count(),
    prisma.blogPost.count(),
    prisma.quoteRequest.count({ where: { status: "new" } }),
    prisma.contactMessage.count({ where: { status: "new" } }),
  ]);

  const cards = [
    { label: "Sản phẩm", value: productCount, href: "/admin/san-pham" },
    { label: "Danh mục", value: categoryCount, href: "/admin/danh-muc" },
    { label: "Lĩnh vực hoạt động", value: industryCount, href: "/admin/linh-vuc" },
    { label: "Bài viết", value: postCount, href: "/admin/bai-viet" },
    {
      label: "Yêu cầu báo giá mới",
      value: newQuoteCount,
      href: "/admin/yeu-cau-bao-gia",
      highlight: newQuoteCount > 0,
    },
    {
      label: "Liên hệ mới",
      value: newContactCount,
      href: "/admin/lien-he",
      highlight: newContactCount > 0,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Chào mừng bạn quay lại trang quản trị Phúc Thọ.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p
              className={
                "mt-2 text-3xl font-extrabold " +
                (card.highlight ? "text-amber-600" : "text-slate-900")
              }
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
