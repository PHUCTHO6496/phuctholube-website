import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { BRANDS, SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, industries, posts] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.productCategory.findMany({ select: { slug: true } }),
    prisma.industry.findMany({ select: { slug: true } }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/san-pham`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/tra-cuu-tuong-duong`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/linh-vuc-hoat-dong`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/ve-chung-toi`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/dich-vu`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/tin-tuc`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/lien-he`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/san-pham/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/san-pham/danh-muc/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const brandUrls: MetadataRoute.Sitemap = BRANDS.map((b) => ({
    url: `${SITE_URL}/san-pham/thuong-hieu/${b.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const industryUrls: MetadataRoute.Sitemap = industries.map((i) => ({
    url: `${SITE_URL}/linh-vuc-hoat-dong/${i.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/tin-tuc/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
    ...brandUrls,
    ...industryUrls,
    ...postUrls,
  ];
}
