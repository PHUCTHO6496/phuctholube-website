import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";

async function getIndustry(slug: string) {
  return prisma.industry.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustry(slug);
  if (!industry) return {};
  return {
    title: industry.name,
    description:
      industry.description ??
      `Giải pháp dầu nhớt công nghiệp cho ngành ${industry.name}.`,
  };
}

export async function generateStaticParams() {
  const industries = await prisma.industry.findMany({ select: { slug: true } });
  return industries.map((i) => ({ slug: i.slug }));
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustry(slug);
  if (!industry) notFound();

  const products = await prisma.product.findMany({
    where: { published: true, industries: { some: { slug } } },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      shortDescription: true,
      category: { select: { name: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/linh-vuc-hoat-dong" className="hover:text-blue-900">
          Lĩnh vực hoạt động
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">{industry.name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">
        {industry.name}
      </h1>
      {industry.description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {industry.description}
        </p>
      )}

      <p className="mt-6 text-sm text-slate-500">
        {products.length > 0
          ? `${products.length} sản phẩm phù hợp`
          : "Chưa có sản phẩm gắn nhãn cụ thể cho ngành này"}
      </p>

      {products.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          Liên hệ với chúng tôi để được tư vấn sản phẩm phù hợp cho ngành{" "}
          {industry.name.toLowerCase()}.
          <div className="mt-4">
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
