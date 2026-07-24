import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm, type ProductFormInitialData } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, industries] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
        industries: { select: { id: true } },
      },
    }),
    prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.industry.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  const initialData: ProductFormInitialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand ?? "",
    price: product.price?.toString() ?? "",
    tdsUrl: product.tdsUrl ?? "",
    msdsUrl: product.msdsUrl ?? "",
    viscosityGrade: product.viscosityGrade ?? "",
    shortDescription: product.shortDescription ?? "",
    shortDescriptionEn: product.shortDescriptionEn ?? "",
    description: product.description ?? "",
    descriptionEn: product.descriptionEn ?? "",
    useCases: Array.isArray(product.useCases) ? (product.useCases as string[]).join("\n") : "",
    useCasesEn: Array.isArray(product.useCasesEn)
      ? (product.useCasesEn as string[]).join("\n")
      : "",
    applicationTags: Array.isArray(product.applicationTags)
      ? (product.applicationTags as string[]).join("\n")
      : "",
    applicationTagsEn: Array.isArray(product.applicationTagsEn)
      ? (product.applicationTagsEn as string[]).join("\n")
      : "",
    featured: product.featured,
    published: product.published,
    categoryId: product.categoryId ?? "",
    industryIds: product.industries.map((i) => i.id),
    images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
    specs: product.specs.map((s) => ({ label: s.label, labelEn: s.labelEn ?? "", value: s.value })),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Sửa sản phẩm</h1>
      <div className="mt-6">
        <ProductForm categories={categories} industries={industries} initialData={initialData} />
      </div>
    </div>
  );
}
