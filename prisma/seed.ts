import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ISO_VG_GRADES = new Set([
  "15", "22", "32", "46", "68", "100", "150", "220", "320", "460", "680", "1000",
]);

function extractViscosityGrade(name: string): string | null {
  const saeMatch = name.match(/\b\d{1,2}W-\d{1,2}\b/);
  if (saeMatch) return saeMatch[0];

  const isoMatches = name.match(/\b\d{1,4}\b/g) ?? [];
  const validIso = isoMatches.filter((m) => ISO_VG_GRADES.has(m));
  if (validIso.length > 0) return validIso[validIso.length - 1];

  return null;
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORIES = [
  { name: "Dầu thủy lực", description: "Dầu bôi trơn cho hệ thống thủy lực máy công nghiệp, xây dựng, nông nghiệp." },
  { name: "Dầu động cơ diesel", description: "Dầu động cơ dành cho xe tải, xe khách và máy móc sử dụng động cơ diesel." },
  { name: "Dầu động cơ xăng", description: "Dầu động cơ cho ô tô và xe thương mại sử dụng động cơ xăng." },
  { name: "Dầu bánh răng", description: "Dầu bôi trơn hộp số, bánh răng công nghiệp và truyền động." },
  { name: "Dầu máy nén khí", description: "Dầu chuyên dụng cho máy nén khí trục vít và piston." },
  { name: "Dầu tuần hoàn", description: "Dầu cho hệ thống tuần hoàn, ổ trượt và máy công cụ." },
  { name: "Nước làm mát", description: "Dung dịch làm mát cho động cơ và hệ thống radiator." },
  { name: "Mỡ bôi trơn", description: "Mỡ bôi trơn cho ổ trục, bánh răng và khớp nối công nghiệp." },
  { name: "Dầu truyền nhiệt", description: "Dầu tải nhiệt cho hệ thống truyền nhiệt kín và hở." },
  { name: "Dầu cắt gọt", description: "Dầu chuyên dụng cho gia công cơ khí: phay, tiện, khoan, mài." },
  { name: "Dầu tuabin", description: "Dầu chuyên dụng cho tuabin hơi nước và tuabin khí công nghiệp." },
];

const INDUSTRIES = [
  { name: "Dầu khí", description: "Giải pháp bôi trơn cho ngành khai thác và chế biến dầu khí." },
  { name: "Hàng hải", description: "Dầu nhớt cho tàu biển, cảng biển và thiết bị hàng hải." },
  { name: "Sản xuất", description: "Dầu công nghiệp cho nhà máy sản xuất và gia công." },
  { name: "Vận tải", description: "Dầu động cơ cho đội xe tải, xe khách và vận tải hàng hóa." },
  { name: "Xây dựng", description: "Dầu nhớt cho máy móc và thiết bị công trình xây dựng." },
];

const BLOG_POSTS = [
  {
    title:
      "So Sánh Dầu Rãnh Trượt Shell Tonna S2 M 68 Và S3 M 68: Lựa Chọn Nào Tối Ưu Cho Máy CNC?",
    author: "Võ Phúc Thọ",
    publishedAt: new Date("2026-06-03"),
    excerpt:
      "Shell Tonna S2 M 68 và S3 M 68 đều là những giải pháp bôi trơn rãnh trượt xuất sắc từ Shell. S2 M 68 mang lại giải pháp kinh tế, thực dụng cho các nhu cầu cơ bản. Trong khi đó, S3 M 68 chính là chìa khóa công nghệ giúp duy trì độ chính xác tối đa, bảo vệ toàn diện cho các hệ thống CNC đắt tiền và tối ưu tổng chi phí vận hành (TCO) cho doanh nghiệp về lâu dài.",
  },
  {
    title: "So sánh dầu Corena S3 R46 và Corena S4 R46",
    author: "Nguyễn Văn Lân",
    publishedAt: new Date("2026-06-01"),
    excerpt:
      "So sánh chi tiết dầu Shell Corena S3 R46 và S4 R46 cho máy nén khí trục vít: gốc dầu, tuổi thọ, độ ổn định nhiệt và chu kỳ thay dầu.",
  },
  {
    title: "Sự khác biệt giữa Gadus S2 V220 2 và Gadus S3 V220 C2",
    author: "Trần Thị Mai",
    publishedAt: new Date("2026-05-25"),
    excerpt:
      "Phân biệt mỡ Shell Gadus S2 V220 2 và S3 V220 C2 về cấp NLGI, phụ gia, khả năng chịu tải và môi trường làm việc phù hợp.",
  },
  {
    title: "Mỡ bôi cáp Gadus S2 A320 và Gadus S2 OG 40",
    author: "Lê Hoàng Nam",
    publishedAt: new Date("2026-05-18"),
    excerpt:
      "Hướng dẫn chọn mỡ bôi cáp Shell Gadus S2 A320 và S2 OG 40 theo độ nhớt, độ bám dính và khả năng chịu tải.",
  },
  {
    title: "So sánh Gadus S2 OG 40 và Mobilarma 798",
    author: "Phạm Quốc Việt",
    publishedAt: new Date("2026-05-11"),
    excerpt:
      "So sánh mỡ bánh răng hở Shell Gadus S2 OG 40 với Mobilarma 798: thành phần, chống gỉ, độ bám và phương án thay thế tương đương.",
  },
  {
    title: "Kết Quả Test Mẫu Dầu Nói Lên Điều Gì?",
    author: "Đỗ Thị Hương",
    publishedAt: new Date("2026-05-04"),
    excerpt:
      "Giải thích ý nghĩa kết quả phân tích mẫu dầu định kỳ: độ nhớt, TAN/TBN, kim loại mài mòn và cách tối ưu bảo dưỡng thiết bị.",
  },
];

type SeedProduct = {
  name: string;
  category: string;
  brand: string;
  use: string;
  tags: string[];
  price: number;
  featured?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  { name: "Shell Tellus S2 MX 46 (209L)", category: "Dầu thủy lực", brand: "Shell", use: "Hệ thống thủy lực máy ép, máy xúc, máy CNC, bơm piston, bơm cánh gạt", tags: ["Công nghiệp nặng", "Xây dựng", "Sản xuất"], price: 12080000, featured: true },
  { name: "Shell Rimula R4 X 15W-40 (209L)", category: "Dầu động cơ diesel", brand: "Shell", use: "Xe tải nặng, xe khách, máy công trình, động cơ diesel off-highway", tags: ["Vận tải", "Xây dựng", "Xe công trình"], price: 15873050, featured: true },
  { name: "Shell Omala S2 GX 220 (209L)", category: "Dầu bánh răng", brand: "Shell", use: "Hộp số công nghiệp, bánh răng kín, ổ trục", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ"], price: 13402000 },
  { name: "Shell Omala S4 GXV 460 (209L)", category: "Dầu bánh răng", brand: "Shell", use: "Hộp số công nghiệp nặng đặc biệt, máy nghiền, máy cán", tags: ["Sản xuất thép", "Xi măng", "Hộp số nặng"], price: 60306500 },
  { name: "Shell Corena S4 R 46 (209L)", category: "Dầu máy nén khí", brand: "Shell", use: "Máy nén khí trục vít, máy nén piston cao cấp, tuổi thọ 8.000+ giờ", tags: ["Sản xuất", "Năng lượng", "Dệt may"], price: 58666300 },
  { name: "Shell Morlina S2 B 220 (209L)", category: "Dầu tuần hoàn", brand: "Shell", use: "Hệ thống tuần hoàn, ổ trượt, ổ trục, hộp số nhẹ", tags: ["Giấy", "Dệt may", "Sản xuất điện"], price: 16051200 },
  { name: "Shell Gadus S3 V220C 2 (18KG)", category: "Mỡ bôi trơn", brand: "Shell", use: "Ổ trục, ổ bánh răng, ổ trục lò nhiệt, xe tải nặng", tags: ["Công nghiệp nặng", "Ô tô", "Xây dựng", "Hàng hải"], price: 2961000 },
  { name: "Shell Air Tool Oil S2 A 100 (209L)", category: "Dầu máy nén khí", brand: "Shell", use: "Máy nén khí dụng cụ (air tools), máy nén nhỏ, thiết bị khí nén", tags: ["Sản xuất", "Dịch vụ", "Gia công"], price: 15340600 },
  { name: "Shell Spirax S2 A 80W-90 (209L)", category: "Dầu bánh răng", brand: "Shell", use: "Hộp số truyền động, axle, differential xe tải và máy nông nghiệp", tags: ["Nông nghiệp", "Xây dựng", "Vận tải"], price: 14932600 },
  { name: "Shell Heat Transfer Oil S2 (209L)", category: "Dầu truyền nhiệt", brand: "Shell", use: "Hệ thống truyền nhiệt kín và hở, lò dầu tải nhiệt", tags: ["Hóa chất", "Thực phẩm", "Dược phẩm", "Nhựa"], price: 12017500 },
  { name: "Mobil DTE 25 Ultra 46", category: "Dầu thủy lực", brand: "Mobil", use: "Hệ thống thủy lực máy ép, máy xúc, máy CNC, bơm piston cao áp", tags: ["Công nghiệp nặng", "Xây dựng", "Sản xuất máy"], price: 4500000, featured: true },
  { name: "Mobil SHC 630", category: "Dầu bánh răng", brand: "Mobil", use: "Hộp số công nghiệp nặng, máy cán, máy nghiền, băng tải, ổ trục", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ", "Hộp số công nghiệp"], price: 6500000 },
  { name: "Mobil SHC 632", category: "Dầu bánh răng", brand: "Mobil", use: "Hộp số nặng, ổ trục, máy cán, hệ thống tuần hoàn công nghiệp nặng", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ", "Hộp số công nghiệp"], price: 6800000 },
  { name: "Mobil Rarus 426", category: "Dầu máy nén khí", brand: "Mobil", use: "Máy nén khí trục vít, máy nén piston, máy nén rotor, crankcase", tags: ["Sản xuất", "Năng lượng", "Dệt may"], price: 4200000 },
  { name: "Mobil Vacuoline 1405", category: "Dầu tuần hoàn", brand: "Mobil", use: "Máy CNC, máy tiện, máy phay - dùng một dầu cho cả thủy lực và way (bề mặt trượt)", tags: ["Giấy", "Dệt may", "Sản xuất điện", "Máy công cụ"], price: 3800000 },
  { name: "Mobil Delvac MX 15W-40", category: "Dầu động cơ diesel", brand: "Mobil", use: "Xe tải nặng, xe khách, xe ben, máy công trình (excavator, loader), máy phát điện diesel", tags: ["Vận tải", "Xây dựng", "Nông nghiệp", "Xe công trình"], price: 4500000, featured: true },
  { name: "Mobil Antifreeze Extra", category: "Nước làm mát", brand: "Mobil", use: "Radiator xe tải, xe công trình, diesel engine, hệ thống làm mát công nghiệp", tags: ["Vận tải", "Xây dựng", "Nông nghiệp", "Công nghiệp nặng"], price: 3500000 },
  { name: "Mobilgrease XHP 222", category: "Mỡ bôi trơn", brand: "Mobil", use: "Ổ trục bánh răng, ổ trục lò nhiệt, xe tải, xe công trình, ổ trục công nghiệp nặng", tags: ["Công nghiệp nặng", "Ô tô", "Xây dựng", "Hàng hải", "Nông nghiệp"], price: 3200000 },
  { name: "Mobil DTE 10 Excel 46", category: "Dầu thủy lực", brand: "Mobil", use: "Hệ thống thủy lực áp suất cao, servo valve, proportional valve hiện đại, máy CNC", tags: ["Công nghiệp nặng", "Hàng không", "Hải quân", "Máy CNC cao cấp"], price: 5200000 },
  { name: "Mobil Cut 140", category: "Dầu cắt gọt", brand: "Mobil", use: "Phay, tiện, khoan, taro, cưa, mài - kim loại đen và kim loại màu", tags: ["Gia công cơ khí", "Chế tạo máy", "Công nghiệp precision"], price: 4800000 },
  { name: "Total Rubia TIR 8900 15W-40", category: "Dầu động cơ diesel", brand: "Total", use: "Xe tải nặng EURO VI, xe khách, xe ben, xe công trình, động cơ diesel cao cấp", tags: ["Vận tải", "Xây dựng", "Nông nghiệp"], price: 4200000, featured: true },
  { name: "Total Azolla ZS 68", category: "Dầu thủy lực", brand: "Total", use: "Hệ thống thủy lực máy nông nghiệp, tàu biển, máy móc công nghiệp", tags: ["Nông nghiệp", "Hàng hải", "Công nghiệp nặng"], price: 3100000 },
  { name: "Total Carter EP 220", category: "Dầu bánh răng", brand: "Total", use: "Hộp số công nghiệp, bánh răng hở, hệ thống truyền động, ổ trục", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ"], price: 3800000 },
  { name: "Total Dacnis VS 68", category: "Dầu máy nén khí", brand: "Total", use: "Máy nén khí trục vít, máy nén khí piston, hệ thống khí nén công nghiệp", tags: ["Sản xuất", "Năng lượng", "Dệt may"], price: 1850000 },
  { name: "Total Lunia SZ 150", category: "Dầu tuần hoàn", brand: "Total", use: "Hệ thống tuần hoàn, ổ trượt, hộp số nhẹ, máy công cụ", tags: ["Giấy", "Dệt may", "Sản xuất điện", "Máy công cụ"], price: 3600000 },
  { name: "Total Antifreeze Classic", category: "Nước làm mát", brand: "Total", use: "Radiator ô tô, xe tải, xe công trình, hệ thống làm mát động cơ diesel", tags: ["Vận tải", "Xây dựng", "Công nghiệp nặng"], price: 2800000 },
  { name: "Total Multis EP 2", category: "Mỡ bôi trơn", brand: "Total", use: "Ổ trục, ổ bánh răng, khớp nối, bôi trơn general purpose công nghiệp", tags: ["Công nghiệp nặng", "Ô tô", "Xây dựng", "Nông nghiệp"], price: 2900000 },
  { name: "Total Dactylone FS 46", category: "Dầu truyền nhiệt", brand: "Total", use: "Hệ thống truyền nhiệt kín và hở, lò dầu tải nhiệt, hệ thống sưởi công nghiệp", tags: ["Hóa chất", "Thực phẩm", "Dược phẩm", "Nhựa"], price: 4500000 },
  { name: "Total Azolla ZS 46", category: "Dầu thủy lực", brand: "Total", use: "Hệ thống thủy lực máy xúc, máy ép, máy CNC, máy nông nghiệp", tags: ["Công nghiệp nặng", "Xây dựng", "Nông nghiệp"], price: 3000000, featured: true },
  { name: "Total Carter EP 320", category: "Dầu bánh răng", brand: "Total", use: "Hộp số công nghiệp nặng, bánh răng chịu tải nặng, máy nghiền, máy cán", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ", "Hộp số nặng"], price: 4100000 },
  { name: "Castrol Hyspin AWS 46", category: "Dầu thủy lực", brand: "Castrol", use: "Hệ thống thủy lực công nghiệp, máy ép, máy công cụ, bơm cánh gạt, bơm piston", tags: ["Công nghiệp nặng", "Sản xuất", "Xây dựng"], price: 1900000, featured: true },
  { name: "Castrol Vecton Long Drain 15W-40 CK-4", category: "Dầu động cơ diesel", brand: "Castrol", use: "Xe tải nặng, xe khách đường dài, động cơ diesel EURO V, kéo dài chu kỳ thay dầu", tags: ["Vận tải", "Xây dựng"], price: 1700000, featured: true },
  { name: "Castrol Hyspin AWS 68", category: "Dầu thủy lực", brand: "Castrol", use: "Hệ thống thủy lực tải nặng, máy xúc, cầu trục, thiết bị cảng biển", tags: ["Công nghiệp nặng", "Hàng hải", "Xây dựng"], price: 2000000 },
  { name: "Castrol Alpha SP 220", category: "Dầu bánh răng", brand: "Castrol", use: "Hộp số công nghiệp, bánh răng kín chịu tải nặng, máy nghiền, băng tải", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ"], price: 3900000 },
  { name: "Castrol Alpha SP 320", category: "Dầu bánh răng", brand: "Castrol", use: "Hộp số công nghiệp nặng, máy cán, máy nghiền tải trọng lớn", tags: ["Sản xuất thép", "Xi măng", "Hộp số nặng"], price: 4200000 },
  { name: "Castrol Aircol PD 68", category: "Dầu máy nén khí", brand: "Castrol", use: "Máy nén khí piston và trục vít công nghiệp, hệ thống khí nén", tags: ["Sản xuất", "Năng lượng", "Dệt may"], price: 2100000 },
  { name: "Castrol Spheerol EPL 2", category: "Mỡ bôi trơn", brand: "Castrol", use: "Ổ trục, ổ bi, khớp nối công nghiệp và ô tô, chịu cực áp EP", tags: ["Công nghiệp nặng", "Ô tô", "Xây dựng"], price: 2700000 },
  { name: "Castrol CRB Turbomax 15W-40", category: "Dầu động cơ diesel", brand: "Castrol", use: "Xe tải, máy công trình, máy phát điện diesel, động cơ turbo tăng áp", tags: ["Vận tải", "Xây dựng", "Nông nghiệp"], price: 1300000 },
  { name: "Castrol Magnatec 10W-40", category: "Dầu động cơ xăng", brand: "Castrol", use: "Ô tô con, động cơ xăng hiện đại, bảo vệ động cơ ngay khi khởi động", tags: ["Ô tô con", "Xe thương mại"], price: 1600000 },
  { name: "Castrol Perfecto T 46", category: "Dầu tuabin", brand: "Castrol", use: "Tuabin hơi và tuabin khí, hệ thống tuần hoàn công nghiệp", tags: ["Sản xuất điện", "Năng lượng"], price: 3400000 },
  { name: "Shell Turbo T 46", category: "Dầu tuabin", brand: "Shell", use: "Tuabin hơi nước và tuabin khí công nghiệp, hệ thống bôi trơn ổ trục tuabin", tags: ["Sản xuất điện", "Năng lượng"], price: 13500000 },
  { name: "Shell Tellus S2 VX 46", category: "Dầu thủy lực", brand: "Shell", use: "Hệ thống thủy lực đa cấp hiệu suất cao, máy công trình di động, thiết bị nông nghiệp", tags: ["Xây dựng", "Nông nghiệp", "Công nghiệp nặng"], price: 11500000 },
  { name: "Shell Corena S2 P100", category: "Dầu máy nén khí", brand: "Shell", use: "Máy nén khí piston công nghiệp phổ thông, tải trung bình", tags: ["Sản xuất", "Gia công"], price: 4800000 },
  { name: "Shell Helix HX7 10W-40", category: "Dầu động cơ xăng", brand: "Shell", use: "Ô tô con động cơ xăng, xe thương mại nhẹ, bảo vệ động cơ trong điều kiện vận hành đa dạng", tags: ["Ô tô con", "Xe thương mại"], price: 1450000 },
  { name: "Shell Ertelon 220", category: "Dầu bánh răng", brand: "Shell", use: "Hộp số công nghiệp mở, bánh răng hở chịu tải nặng, băng tải", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ"], price: 5300000 },
  { name: "Mobilgear 600 XP 220", category: "Dầu bánh răng", brand: "Mobil", use: "Hộp số công nghiệp chịu cực áp, bảo vệ chống rỗ vi mô và mài mòn vòng bi", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ", "Hộp số công nghiệp"], price: 4600000 },
  { name: "Mobil Delvac 1 5W-40", category: "Dầu động cơ diesel", brand: "Mobil", use: "Xe tải hạng nặng đường dài, động cơ diesel full synthetic, kéo dài chu kỳ thay dầu", tags: ["Vận tải", "Xe công trình"], price: 5800000 },
  { name: "Mobil DTE 26", category: "Dầu thủy lực", brand: "Mobil", use: "Hệ thống thủy lực đa dụng, máy công nghiệp tải trung bình, bơm bánh răng", tags: ["Công nghiệp nặng", "Sản xuất"], price: 3900000 },
  { name: "Mobil Turbo Oil 32", category: "Dầu tuabin", brand: "Mobil", use: "Tuabin khí và tuabin hơi công nghiệp, hệ thống điều tốc tuabin", tags: ["Sản xuất điện", "Năng lượng"], price: 14200000 },
  { name: "Mobil Super 3000 5W-40", category: "Dầu động cơ xăng", brand: "Mobil", use: "Ô tô con động cơ xăng thế hệ mới, bảo vệ tối ưu khi khởi động lạnh", tags: ["Ô tô con", "Xe thương mại"], price: 1550000 },
  { name: "Total Quartz 9000 5W-40", category: "Dầu động cơ xăng", brand: "Total", use: "Ô tô con động cơ xăng full synthetic, hiệu suất cao cho xe đời mới", tags: ["Ô tô con", "Xe thương mại"], price: 1500000 },
  { name: "Total Drosera MS 46", category: "Dầu tuabin", brand: "Total", use: "Tuabin hơi nước công nghiệp, hệ thống bôi trơn và điều khiển tuabin", tags: ["Sản xuất điện", "Năng lượng"], price: 13000000 },
  { name: "Total Cortusa SP 68", category: "Dầu tuần hoàn", brand: "Total", use: "Bôi trơn đường trượt máy công cụ (way lubricant), máy tiện, máy phay CNC", tags: ["Máy công cụ", "Sản xuất"], price: 3300000 },
  { name: "Total Carter EP 460", category: "Dầu bánh răng", brand: "Total", use: "Hộp số công nghiệp siêu tải trọng, máy nghiền, máy cán thép", tags: ["Sản xuất thép", "Xi măng", "Khai thác mỏ", "Hộp số nặng"], price: 4700000 },
  { name: "Total Nevastane AW 46", category: "Dầu thủy lực", brand: "Total", use: "Hệ thống thủy lực đạt chuẩn cấp thực phẩm, ngành chế biến thực phẩm và dược phẩm", tags: ["Thực phẩm", "Dược phẩm"], price: 5900000 },
  { name: "Castrol Optigear BM 220", category: "Dầu bánh răng", brand: "Castrol", use: "Hộp số công nghiệp tải trung bình, bánh răng kín, ổ trục", tags: ["Sản xuất", "Sản xuất thép"], price: 3700000 },
  { name: "Castrol Tribol 800", category: "Dầu tuần hoàn", brand: "Castrol", use: "Bôi trơn đường trượt máy công cụ, máy CNC, hệ thống tuần hoàn chính xác", tags: ["Máy công cụ", "Sản xuất"], price: 3200000 },
  { name: "Castrol GTX 20W-50", category: "Dầu động cơ xăng", brand: "Castrol", use: "Ô tô con động cơ xăng đời cũ, bảo vệ chống mài mòn ở nhiệt độ cao", tags: ["Ô tô con", "Xe cũ"], price: 1250000 },
  { name: "Castrol Aircol SN 100", category: "Dầu máy nén khí", brand: "Castrol", use: "Máy nén khí trục vít công nghiệp, hệ thống khí nén tải nặng", tags: ["Sản xuất", "Năng lượng"], price: 4400000 },
  { name: "Castrol Alphasyn PG 220", category: "Dầu bánh răng", brand: "Castrol", use: "Hộp số công nghiệp tổng hợp, tải cực nặng, nhiệt độ vận hành cao", tags: ["Sản xuất thép", "Xi măng", "Hộp số nặng"], price: 5100000 },
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (const [i, c] of CATEGORIES.entries()) {
    const slug = slugify(c.name);
    const record = await prisma.productCategory.upsert({
      where: { slug },
      update: { name: c.name, description: c.description, sortOrder: i },
      create: { name: c.name, slug, description: c.description, sortOrder: i },
    });
    categoryMap.set(c.name, record.id);
  }

  console.log("Seeding industries...");
  const industryMap = new Map<string, string>();
  for (const [i, ind] of INDUSTRIES.entries()) {
    const slug = slugify(ind.name);
    const record = await prisma.industry.upsert({
      where: { slug },
      update: { name: ind.name, description: ind.description, sortOrder: i },
      create: { name: ind.name, slug, description: ind.description, sortOrder: i },
    });
    industryMap.set(ind.name, record.id);
  }

  console.log("Removing discontinued brands...");
  const removed = await prisma.product.deleteMany({
    where: { brand: { notIn: [...new Set(PRODUCTS.map((p) => p.brand))] } },
  });
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} product(s) from discontinued brands.`);
  }

  console.log("Seeding products...");
  for (const [i, p] of PRODUCTS.entries()) {
    const slug = slugify(p.name);
    const useCases = p.use.split(",").map((s) => s.trim()).filter(Boolean);
    const packagingMatch = p.name.match(/\(([^)]+)\)/);
    const viscosityGrade = extractViscosityGrade(p.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.product.delete({ where: { slug } });
    }

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        brand: p.brand,
        price: p.price,
        viscosityGrade,
        shortDescription: p.use,
        description: `${p.name} là sản phẩm ${p.category.toLowerCase()} thuộc thương hiệu ${p.brand}, phù hợp cho ${p.use}.`,
        useCases,
        applicationTags: p.tags,
        featured: p.featured ?? false,
        sortOrder: i,
        category: { connect: { id: categoryMap.get(p.category) } },
        industries: {
          connect: p.tags
            .filter((t) => industryMap.has(t))
            .map((t) => ({ id: industryMap.get(t)! })),
        },
        specs: {
          create: [
            { label: "Thương hiệu", value: p.brand, sortOrder: 0 },
            ...(packagingMatch
              ? [{ label: "Quy cách", value: packagingMatch[1], sortOrder: 1 }]
              : []),
          ],
        },
      },
    });
  }

  console.log("Seeding blog posts...");
  for (const post of BLOG_POSTS) {
    const slug = slugify(post.title);
    await prisma.blogPost.upsert({
      where: { slug },
      update: {
        title: post.title,
        author: post.author,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
      },
      create: {
        title: post.title,
        slug,
        author: post.author,
        excerpt: post.excerpt,
        contentHtml: `<p>${post.excerpt}</p>`,
        published: true,
        publishedAt: post.publishedAt,
      },
    });
  }

  console.log("Seeding site settings...");
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log("Seeding admin user...");
  const adminEmail = "phuctho6496@gmail.com";
  const defaultPassword = "phuctho@2026";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash },
  });
  console.log(`Admin user ready: ${adminEmail} / mật khẩu mặc định: ${defaultPassword} (sẽ đổi ở Phase 4)`);

  console.log("Seed hoàn tất.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
