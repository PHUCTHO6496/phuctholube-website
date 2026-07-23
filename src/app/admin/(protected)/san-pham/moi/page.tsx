import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, industries] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.industry.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Thêm sản phẩm</h1>
      <div className="mt-6">
        <ProductForm categories={categories} industries={industries} />
      </div>
    </div>
  );
}
