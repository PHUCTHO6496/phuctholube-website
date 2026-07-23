import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TaxonomyForm, type TaxonomyFormData } from "@/components/admin/TaxonomyForm";
import { createIndustry, updateIndustry } from "@/lib/actions/admin-industries";

export default async function EditIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const industry = await prisma.industry.findUnique({ where: { id } });
  if (!industry) notFound();

  const initialData: TaxonomyFormData = {
    id: industry.id,
    name: industry.name,
    slug: industry.slug,
    description: industry.description ?? "",
    image: industry.image ?? "",
    sortOrder: industry.sortOrder.toString(),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sửa lĩnh vực hoạt động</h1>
      <div className="mt-6">
        <TaxonomyForm
          listHref="/admin/linh-vuc"
          initialData={initialData}
          createAction={createIndustry}
          updateAction={updateIndustry}
        />
      </div>
    </div>
  );
}
