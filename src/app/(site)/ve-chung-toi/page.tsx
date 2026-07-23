import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, Gem, HeartHandshake, Warehouse } from "lucide-react";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description:
    "Gần 30 năm kinh nghiệm cung cấp dầu nhớt công nghiệp chất lượng cao, đồng hành cùng hàng nghìn doanh nghiệp tại Hồ Chí Minh.",
};

const MISSION_CARDS = [
  {
    icon: Target,
    title: "Sứ mệnh của chúng tôi",
    description:
      "Cung cấp giải pháp bôi trơn toàn diện - không chỉ là sản phẩm dầu nhớt chất lượng cao, mà còn là dịch vụ tư vấn kỹ thuật chuyên sâu.",
  },
  {
    icon: Eye,
    title: "Tầm nhìn",
    description:
      "Trở thành đối tác tin cậy hàng đầu trong lĩnh vực cung cấp dầu nhớt công nghiệp.",
  },
  {
    icon: Gem,
    title: "Giá trị cốt lõi",
    description:
      "Chất lượng, uy tín, chuyên nghiệp và luôn đặt lợi ích khách hàng lên hàng đầu.",
  },
  {
    icon: HeartHandshake,
    title: "Cam kết",
    description:
      "Đồng hành cùng khách hàng trên hành trình vận hành bền vững và hiệu quả.",
  },
  {
    icon: Warehouse,
    title: "Cơ sở vật chất",
    description:
      "Hệ thống kho bãi hiện đại, quy mô lớn với công suất lưu trữ khổng lồ.",
  },
];

const COMMITMENTS = [
  { title: "Chất lượng 100%", description: "Sản phẩm chính hãng, kiểm định và bảo quản nghiêm ngặt" },
  { title: "Giải pháp tối ưu", description: "Kỹ thuật tối ưu cho từng ngành nghề, tăng hiệu suất thiết bị" },
  { title: "Dịch vụ chuyên nghiệp", description: "Nhanh chóng - chuyên nghiệp - tận tâm, hỗ trợ 24/7" },
  { title: "Đội ngũ chuyên gia", description: "Kỹ thuật viên giàu kinh nghiệm, tư vấn chuyên sâu" },
  { title: "Kho bãi hiện đại", description: "Hệ thống kho bãi hiện đại, đảm bảo chất lượng tốt nhất" },
  { title: "Giao hàng nhanh", description: "Mạng lưới phân phối rộng khắp, giao hàng tận nơi" },
];

export default async function AboutPage() {
  const industries = await prisma.industry.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Từ năm {SITE.foundedYear}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Về {SITE.fullName}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Gần 30 năm kinh nghiệm cung cấp dầu nhớt công nghiệp chất lượng
            cao, đồng hành cùng hàng nghìn doanh nghiệp tại Hồ Chí Minh.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {MISSION_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 p-6"
              >
                <card.icon className="h-8 w-8 text-amber-500" />
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Hành trình phát triển
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Từ năm {SITE.foundedYear}, {SITE.name} tự hào là nhà phân phối dầu
            nhớt công nghiệp uy tín hàng đầu tại Hồ Chí Minh. Với gần 30 năm
            kinh nghiệm, chúng tôi đã đồng hành cùng hàng nghìn doanh nghiệp
            trong các lĩnh vực: dầu khí, cảng biển và hàng hải, giúp tối ưu
            hiệu suất thiết bị.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-2 sm:max-w-md">
            <div>
              <div className="text-4xl font-extrabold text-blue-900">
                {SITE.foundedYear}
              </div>
              <p className="mt-1 text-sm text-slate-600">Năm thành lập</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-900">1000+</div>
              <p className="mt-1 text-sm text-slate-600">Khách hàng tin tưởng</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Cam kết của {SITE.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Với đội ngũ kỹ thuật viên giàu kinh nghiệm và hệ thống kho bãi
            hiện đại
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMMITMENTS.map((c) => (
              <div key={c.title} className="rounded-xl bg-slate-50 p-6">
                <h3 className="text-base font-bold text-slate-900">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              Ngành nghề phục vụ
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Đồng hành cùng các doanh nghiệp trong nhiều lĩnh vực
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/linh-vuc-hoat-dong/${ind.slug}`}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
              >
                {ind.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
