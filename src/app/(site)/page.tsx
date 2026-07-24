import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Wrench,
  Warehouse,
  BadgePercent,
  Quote,
} from "lucide-react";
import { BRANDS, HOME_SERVICES, SITE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/site/ProductCard";
import { getSiteSettings } from "@/lib/settings";
import { formatPhoneDisplay } from "@/lib/format";

const HIGHLIGHTS = [
  "100% sản phẩm chính hãng, được kiểm định nghiêm ngặt",
  "Giải pháp kỹ thuật tối ưu cho mọi ngành công nghiệp",
  "Dịch vụ nhanh chóng – chuyên nghiệp – tận tâm",
];

const TRUST_VALUES = [
  {
    icon: ShieldCheck,
    title: "Chất lượng đảm bảo",
    description:
      "Chỉ phân phối dầu nhớt chính hãng Shell, Mobil, Total, Castrol — nguồn gốc rõ ràng, đầy đủ chứng từ CO/CQ.",
  },
  {
    icon: Wrench,
    title: "Hỗ trợ kỹ thuật",
    description:
      "Đội ngũ kỹ thuật giàu kinh nghiệm tư vấn chọn dầu đúng ứng dụng, hỗ trợ phân tích mẫu dầu định kỳ.",
  },
  {
    icon: Warehouse,
    title: "Nguồn cung ổn định",
    description:
      "Kho hàng lớn tại Vũng Tàu, sẵn hàng số lượng lớn — giao nhanh trong khu vực và các tỉnh lân cận.",
  },
  {
    icon: BadgePercent,
    title: "Giá cạnh tranh",
    description:
      "Chính sách giá tốt cho đơn hàng số lượng lớn và khách hàng hợp tác lâu dài, chiết khấu minh bạch.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Phúc Thọ tư vấn đúng loại dầu thủy lực cho dàn máy ép của xưởng, chạy ổn định hẳn và chu kỳ thay dầu dài hơn trước.",
    name: "Anh Minh",
    role: "Quản lý xưởng cơ khí, KCN Đông Xuyên",
  },
  {
    quote:
      "Đặt hàng số lượng lớn luôn được giao đúng hẹn, chứng từ đầy đủ. Làm việc với Phúc Thọ rất yên tâm về nguồn gốc hàng hóa.",
    name: "Chị Hằng",
    role: "Phụ trách mua hàng, công ty vận tải biển",
  },
  {
    quote:
      "Khi máy nén khí gặp sự cố, kỹ thuật của Phúc Thọ hỗ trợ kiểm tra dầu và xử lý ngay trong ngày. Dịch vụ rất tận tâm.",
    name: "Anh Tuấn",
    role: "Trưởng bảo trì nhà máy, KCN Phú Mỹ",
  },
];

const SERVICE_AREAS = [
  "KCN Đông Xuyên",
  "KCN Phú Mỹ",
  "KCN Cảng Cái Mép",
  "KCN Long Sơn",
  "KCN Mỹ Xuân",
  "KCN Châu Đức",
  "KCN Đất Đỏ",
  "KCN Gò Dầu",
  "KCN Nhơn Trạch",
  "KCN Long Thành",
  "KCN Biên Hòa",
  "TP. Hồ Chí Minh",
];

export default async function Home() {
  const settings = await getSiteSettings();
  const homeStats = [
    { value: settings.statYearsValue, label: settings.statYearsLabel },
    { value: settings.statVolumeValue, label: settings.statVolumeLabel },
    { value: settings.statQualityValue, label: settings.statQualityLabel },
  ];

  const featuredProducts = await prisma.product.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
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
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              {SITE.fullName}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {SITE.tagline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              Từ năm {SITE.foundedYear}, {SITE.name} tự hào là nhà phân phối
              dầu nhớt công nghiệp uy tín hàng đầu tại Hồ Chí Minh. Với gần 30
              năm kinh nghiệm, chúng tôi đã đồng hành cùng hàng nghìn doanh
              nghiệp trong các lĩnh vực: dầu khí, cảng biển và hàng hải.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-300">
              Sứ mệnh của chúng tôi là cung cấp giải pháp bôi trơn toàn diện –
              không chỉ sản phẩm chất lượng cao, mà còn dịch vụ tư vấn kỹ
              thuật chuyên sâu và hỗ trợ hậu mãi tận tâm.
            </p>

            <ul className="mt-6 space-y-2">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                Xem sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lien-he"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Liên hệ tư vấn
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:flex">
            {settings.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.heroImageUrl}
                alt={SITE.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-slate-400">
                [ Ảnh sản phẩm / kho hàng Phúc Thọ ]
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Tại sao lại là {SITE.name}?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {homeStats.map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-4xl font-extrabold text-blue-900 sm:text-5xl">
                  {stat.value}
                </div>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Thương hiệu phân phối chính hãng
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {SITE.name} là đối tác phân phối các thương hiệu dầu nhớt hàng
              đầu thế giới
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/san-pham/thuong-hieu/${brand.slug}`}
                className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-2xl font-extrabold text-blue-900">
                  {brand.name.charAt(0)}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-900">
                  {brand.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {brand.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900">
                  Xem sản phẩm {brand.name}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {settings.galleryImages.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Thư viện hình ảnh
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Khám phá quy trình sản xuất, lưu trữ và phân phối dầu nhớt công
                nghiệp của {SITE.name}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {settings.galleryImages.map((url, i) => (
                <div
                  key={url}
                  className="aspect-square overflow-hidden rounded-lg bg-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${SITE.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Sản phẩm nổi bật
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Khám phá các dòng sản phẩm dầu nhớt công nghiệp chất lượng cao
                của {SITE.name}.
              </p>
            </div>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-amber-600"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Vì sao doanh nghiệp chọn {SITE.name}?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              4 cam kết cốt lõi làm nên uy tín gần 30 năm của chúng tôi
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-slate-200 p-6"
              >
                <value.icon className="h-9 w-9 text-amber-500" />
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Dịch vụ chuyên nghiệp
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Giải pháp toàn diện đi kèm dịch vụ tận tâm, đảm bảo hệ thống của
              bạn luôn hoạt động trơn tru.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOME_SERVICES.map((s) => (
              <div
                key={s.title}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
                <Link
                  href={s.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-amber-600"
                >
                  Tìm hiểu thêm
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Khách hàng nói về chúng tôi
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200"
              >
                <Quote className="h-6 w-6 text-amber-500" />
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Khu vực phục vụ
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Cung cấp dầu nhớt cho các nhà máy, xí nghiệp tại các khu công
              nghiệp trong khu vực Bà Rịa - Vũng Tàu, Đồng Nai và TP. Hồ Chí
              Minh
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {SERVICE_AREAS.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Liên hệ với chúng tôi
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <MapPin className="h-8 w-8 text-amber-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Địa chỉ
              </p>
              <p className="mt-1 text-sm text-slate-600">{settings.address}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Phone className="h-8 w-8 text-amber-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Điện thoại
              </p>
              <a
                href={`tel:${settings.phone}`}
                className="mt-1 text-sm text-slate-600 hover:text-blue-900"
              >
                {formatPhoneDisplay(settings.phone)}
              </a>
            </div>
            <div className="flex flex-col items-center text-center">
              <Mail className="h-8 w-8 text-amber-500" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Email</p>
              <a
                href={`mailto:${settings.email}`}
                className="mt-1 text-sm text-slate-600 hover:text-blue-900"
              >
                {settings.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
