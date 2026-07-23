import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description:
    "Giải pháp bôi trơn toàn diện với dịch vụ chuyên nghiệp, từ tư vấn kỹ thuật đến hỗ trợ hậu mãi tận tâm.",
};

const CORE_SERVICES = [
  {
    title: "Tư vấn sản phẩm dầu nhớt",
    description:
      "Đội ngũ chuyên gia của chúng tôi sẽ phân tích yêu cầu vận hành, loại máy móc và môi trường hoạt động của bạn để đề xuất các sản phẩm dầu nhớt tối ưu, đảm bảo hiệu suất cao và tuổi thọ thiết bị kéo dài. Chúng tôi cung cấp tư vấn về các loại dầu động cơ, dầu thủy lực, dầu công nghiệp và mỡ bôi trơn.",
    benefits:
      "Tối ưu hóa hiệu suất thiết bị, kéo dài tuổi thọ máy móc, giảm chi phí bảo trì, đảm bảo tuân thủ tiêu chuẩn ngành.",
  },
  {
    title: "Hỗ trợ kỹ thuật chuyên sâu",
    description:
      "Chúng tôi cung cấp dịch vụ hỗ trợ kỹ thuật toàn diện, bao gồm giải đáp các câu hỏi về đặc tính sản phẩm, hướng dẫn sử dụng đúng cách, phân tích sự cố liên quan đến bôi trơn và đưa ra các giải pháp khắc phục. Đội ngũ kỹ sư giàu kinh nghiệm luôn sẵn sàng hỗ trợ bạn qua điện thoại, email hoặc trực tiếp tại hiện trường.",
    benefits:
      "Giải quyết vấn đề nhanh chóng, nâng cao kiến thức về bôi trơn, tối ưu hóa quy trình vận hành, giảm thiểu thời gian ngừng máy.",
  },
  {
    title: "Dịch vụ đặt hàng số lượng lớn",
    description:
      "Dành cho các doanh nghiệp có nhu cầu sử dụng dầu nhớt thường xuyên và với số lượng lớn, chúng tôi cung cấp dịch vụ đặt hàng số lượng lớn với chính sách giá cạnh tranh, chiết khấu hấp dẫn và các tùy chọn giao hàng linh hoạt. Chúng tôi đảm bảo nguồn cung ổn định và chất lượng sản phẩm đồng nhất.",
    benefits:
      "Tiết kiệm chi phí mua hàng, đảm bảo nguồn cung ổn định, quy trình đặt hàng đơn giản, hỗ trợ giao hàng tận nơi.",
  },
  {
    title: "Giải pháp bảo trì toàn diện",
    description:
      "Chúng tôi cung cấp các giải pháp bảo trì toàn diện bao gồm phân tích mẫu dầu định kỳ, kiểm tra tình trạng máy móc, lập kế hoạch thay dầu và bôi trơn, cũng như tư vấn về các biện pháp phòng ngừa. Mục tiêu là giúp khách hàng duy trì hiệu suất tối ưu của thiết bị, giảm thiểu rủi ro hỏng hóc và kéo dài tuổi thọ tài sản.",
    benefits:
      "Giảm thiểu sự cố, kéo dài tuổi thọ thiết bị, tối ưu hóa chi phí bảo trì, tăng cường an toàn vận hành.",
  },
  {
    title: "Đảm bảo chất lượng sản phẩm",
    description:
      "Chất lượng là ưu tiên hàng đầu của chúng tôi. Mọi sản phẩm dầu nhớt đều trải qua quy trình kiểm định chất lượng nghiêm ngặt từ khâu nguyên liệu đầu vào đến sản phẩm cuối cùng. Chúng tôi cung cấp các chứng nhận chất lượng, báo cáo thử nghiệm và đảm bảo sản phẩm đáp ứng hoặc vượt các tiêu chuẩn ngành quốc tế và địa phương.",
    benefits:
      "Yên tâm về chất lượng sản phẩm, tuân thủ các tiêu chuẩn, giảm thiểu rủi ro vận hành, tăng cường uy tín thương hiệu.",
  },
];

const ADDITIONAL_SERVICES = [
  { title: "Tư vấn kỹ thuật chuyên sâu", description: "Đội ngũ kỹ thuật viên giàu kinh nghiệm sẵn sàng tư vấn giải pháp bôi trơn tối ưu cho từng ngành nghề và ứng dụng cụ thể." },
  { title: "Giao hàng nhanh chóng", description: "Hệ thống phân phối rộng khắp, đảm bảo giao hàng nhanh chóng đến tận nơi trong khu vực và các tỉnh lân cận." },
  { title: "Hỗ trợ hậu mãi tận tâm", description: "Dịch vụ chăm sóc khách hàng 24/7, sẵn sàng giải đáp mọi thắc mắc và hỗ trợ kỹ thuật khi cần thiết." },
  { title: "Phân tích dầu nhớt", description: "Dịch vụ phân tích mẫu dầu nhớt định kỳ, giúp theo dõi tình trạng máy móc và dự đoán bảo trì kịp thời." },
];

const PROCESS_STEPS = [
  { step: "01", title: "Tư vấn & Khảo sát", description: "Tìm hiểu nhu cầu và khảo sát hiện trạng thiết bị của khách hàng" },
  { step: "02", title: "Đề xuất giải pháp", description: "Đưa ra giải pháp bôi trơn tối ưu phù hợp với từng ứng dụng" },
  { step: "03", title: "Cung cấp sản phẩm", description: "Giao hàng nhanh chóng với sản phẩm chính hãng 100%" },
  { step: "04", title: "Hỗ trợ & Theo dõi", description: "Hỗ trợ kỹ thuật và theo dõi hiệu quả sử dụng định kỳ" },
];

const COMMITMENT_ITEMS = [
  "Dầu nhớt chính hãng 100% - đạt tiêu chuẩn quốc tế ISO",
  "Tư vấn kỹ thuật chuyên sâu cho từng ứng dụng công nghiệp",
  "Phân tích dầu định kỳ - dự báo bảo trì máy móc kịp thời",
  "Giao hàng nhanh chóng - phục vụ toàn khu vực và lân cận",
  "Hỗ trợ kỹ thuật 24/7 - giải đáp mọi thắc mắc về sản phẩm và ứng dụng",
];

export default function ServicesPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Dịch vụ của chúng tôi
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Giải pháp bôi trơn toàn diện với dịch vụ chuyên nghiệp, từ tư vấn
            kỹ thuật đến hỗ trợ hậu mãi tận tâm.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Dịch vụ chính</h2>
          <p className="mt-1 text-sm text-slate-600">
            Các dịch vụ cốt lõi của Phúc Thọ
          </p>
          <div className="mt-8 space-y-6">
            {CORE_SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold text-slate-900">
                    Lợi ích chính:{" "}
                  </span>
                  <span className="text-slate-600">{s.benefits}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Dịch vụ bổ sung</h2>
          <p className="mt-1 text-sm text-slate-600">
            Các dịch vụ hỗ trợ toàn diện cho khách hàng
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ADDITIONAL_SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Quy trình làm việc</h2>
          <p className="mt-1 text-sm text-slate-600">
            Chúng tôi làm việc theo quy trình chuyên nghiệp và minh bạch
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step}>
                <div className="text-3xl font-extrabold text-amber-500">
                  {s.step}
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Cam kết dịch vụ</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Chúng tôi tin rằng, hiệu quả của khách hàng chính là thành công
            của Phúc Thọ. Hãy để chúng tôi đồng hành cùng bạn trên hành trình
            vận hành bền vững và hiệu quả.
          </p>
          <ul className="mt-6 space-y-2 text-left">
            {COMMITMENT_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/lien-he"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Liên hệ tư vấn
          </Link>
        </div>
      </section>
    </div>
  );
}
