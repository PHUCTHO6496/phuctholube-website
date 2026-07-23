import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">{categories.length} danh mục</p>
        </div>
        <Link
          href="/admin/danh-muc/moi"
          className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Số sản phẩm</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">/{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/danh-muc/${c.id}`}
                    className="text-sm font-semibold text-blue-900 hover:text-amber-600"
                  >
                    Sửa
                  </Link>
                  <DeleteCategoryButton id={c.id} name={c.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
