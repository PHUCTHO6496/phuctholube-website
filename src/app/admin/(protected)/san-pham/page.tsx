import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatVND } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { brand: { contains: q } },
          ],
        }
      : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      price: true,
      published: true,
      featured: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} sản phẩm
          </p>
        </div>
        <Link
          href="/admin/san-pham/moi"
          className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </Link>
      </div>

      <form className="mt-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc thương hiệu..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  {p.brand && <p className="text-xs text-slate-500">{p.brand}</p>}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.category?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatVND(p.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (p.published
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    {p.published ? "Đã xuất bản" : "Nháp"}
                  </span>
                  {p.featured && (
                    <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Nổi bật
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/san-pham/${p.id}`}
                    className="text-sm font-semibold text-blue-900 hover:text-amber-600"
                  >
                    Sửa
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
