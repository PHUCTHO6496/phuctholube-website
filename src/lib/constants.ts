export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://phuctholube.com";

export const SITE = {
  name: "Phúc Thọ",
  fullName: "Dầu Nhớt Phúc Thọ",
  tagline: "Nhà Phân Phối Dầu Nhớt Công Nghiệp Uy Tín Hàng Đầu Hồ Chí Minh",
  foundedYear: 1996,
  phone: "0786060496",
  phoneDisplay: "078 606 0496",
  email: "info@phucthocoltd.com",
  address: "95 Xô Viết Nghệ Tĩnh, Phường Vũng Tàu, Thành Phố Hồ Chí Minh",
  zaloUrl: "https://zalo.me/0786060496",
  hours: [
    { days: "Thứ 2 - Thứ 6", time: "7:30 - 17:00" },
    { days: "Thứ 7", time: "7:30 - 16:30" },
    { days: "Chủ nhật", time: "Đóng cửa" },
  ],
} as const;

export const NAV_ITEMS = [
  { id: "home", href: "/", viOnly: false },
  { id: "products", href: "/san-pham", viOnly: false },
  { id: "equivalentFinder", href: "/tra-cuu-tuong-duong", viOnly: false },
  { id: "industries", href: "/linh-vuc-hoat-dong", viOnly: false },
  { id: "about", href: "/ve-chung-toi", viOnly: false },
  { id: "services", href: "/dich-vu", viOnly: false },
  { id: "blog", href: "/tin-tuc", viOnly: true },
  { id: "contact", href: "/lien-he", viOnly: false },
] as const;

export const HOME_STATS = [
  {
    value: "25+",
    label: "Gần 30 năm đồng hành cùng doanh nghiệp tại Hồ Chí Minh và các khu công nghiệp lân cận.",
  },
  {
    value: "1M",
    label: "Xấp xỉ 1 triệu lít dầu nhớt được cung cấp mỗi năm.",
  },
  {
    value: "100%",
    label: "100% sản phẩm đạt tiêu chuẩn chất lượng toàn cầu, được kiểm định nghiêm ngặt.",
  },
] as const;

export const HOME_SERVICES = [
  {
    title: "Tư vấn sản phẩm dầu nhớt",
    description:
      "Hỗ trợ chuyên sâu để lựa chọn sản phẩm dầu nhớt phù hợp nhất cho nhu cầu của bạn.",
    href: "/dich-vu",
  },
  {
    title: "Hỗ trợ kỹ thuật chuyên sâu",
    description:
      "Giải đáp thắc mắc và hỗ trợ kỹ thuật về ứng dụng dầu nhớt và các vấn đề liên quan.",
    href: "/dich-vu",
  },
  {
    title: "Dịch vụ đặt hàng số lượng lớn",
    description:
      "Cung cấp giải pháp mua dầu nhớt số lượng lớn với giá ưu đãi và logistics hiệu quả.",
    href: "/dich-vu",
  },
] as const;

export const BRANDS = [
  {
    slug: "shell",
    name: "Shell",
    description:
      "Thương hiệu dầu nhớt hàng đầu thế giới với các dòng Tellus, Rimula, Omala, Gadus — giải pháp bôi trơn toàn diện cho công nghiệp và vận tải.",
  },
  {
    slug: "mobil",
    name: "Mobil",
    description:
      "Công nghệ bôi trơn tiên tiến từ ExxonMobil: Mobil DTE, Delvac, SHC, Mobilgrease — hiệu suất vượt trội cho thiết bị công nghiệp nặng.",
  },
  {
    slug: "total",
    name: "Total",
    description:
      "Dầu nhớt TotalEnergies từ Pháp: Rubia, Azolla, Carter — chất lượng châu Âu với giá thành cạnh tranh cho mọi ngành công nghiệp.",
  },
  {
    slug: "castrol",
    name: "Castrol",
    description:
      "Thương hiệu dầu nhớt Anh Quốc hơn 120 năm: Hyspin, Alpha, Vecton, Magnatec — bảo vệ tối ưu cho động cơ và máy móc công nghiệp.",
  },
] as const;

export type BrandInfo = (typeof BRANDS)[number];

export function getBrandBySlug(slug: string): BrandInfo | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
