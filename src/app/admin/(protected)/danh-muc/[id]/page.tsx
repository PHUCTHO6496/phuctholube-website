import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TaxonomyForm, type TaxonomyFormData } from "@/components/admin/TaxonomyForm";
import { createCategory, updateCategory } from "@/lib/actions/admin-categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.productCategory.findUnique({ where: { id } });
  if (!category) notFound();

  const initialData: TaxonomyFormData = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    sortOrder: category.sortOrder.toString(),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sửa danh mục</h1>
      <div className="mt-6">
        <TaxonomyForm
          listHref="/admin/danh-muc"
          initialData={initialData}
          createAction={createCategory}
          updateAction={updateCategory}
        />
      </div>
    </div>
  );
}
