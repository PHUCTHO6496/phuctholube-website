// Customer-facing policies linked from the footer. English and Chinese versions
// live in ./policies-en.ts and ./policies-zh.ts and must be kept in step with this file. Figures (delivery times, fees, return windows,
// payment terms) were confirmed by the owner on 2026-11-28. When drafting a
// change, wrap unconfirmed values in double square brackets: the policy page
// highlights them so they can't go live unnoticed.

export type PolicyBlock = string | { list: string[] };
export type PolicySection = { heading: string; blocks: PolicyBlock[] };
export type Policy = {
  slug: string;
  title: string;
  titleEn: string;
  titleZh: string;
  description: string;
  updated: string;
  intro?: string;
  sections: PolicySection[];
};
/** A policy's text in another language; title and date come from `Policy`. */
export type PolicyTranslation = { description: string; intro?: string; sections: PolicySection[] };

const OWNER =
  "CÔNG TY TNHH THƯƠNG MẠI PHÚC THỌ (MST 3500378966), chủ sở hữu và vận hành website www.phuctholube.com (sau đây gọi là “Phúc Thọ” hoặc “chúng tôi”)";

export const POLICIES: Policy[] = [
  {
    slug: "bao-mat-thong-tin",
    title: "Chính sách bảo mật thông tin",
    titleEn: "Privacy policy",
    titleZh: "隐私政策",
    description:
      "Phúc Thọ thu thập những thông tin gì qua website, dùng vào việc gì, lưu ở đâu và bạn có những quyền gì đối với dữ liệu cá nhân của mình.",
    updated: "01/12/2026",
    intro: `Chính sách này giải thích cách ${OWNER} thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng website.`,
    sections: [
      {
        heading: "1. Thông tin chúng tôi thu thập",
        blocks: [
          "Chúng tôi chỉ thu thập thông tin do bạn chủ động gửi qua các biểu mẫu trên website:",
          {
            list: [
              "Yêu cầu báo giá: tên công ty, người liên hệ, số điện thoại, email và địa chỉ (không bắt buộc), ghi chú, danh sách sản phẩm và số lượng cần báo giá.",
              "Form liên hệ: họ tên, số điện thoại hoặc email, nội dung tin nhắn.",
              "Đăng ký nhận cẩm nang: họ tên, email, số điện thoại, tên công ty (không bắt buộc) và xác nhận đồng ý của bạn.",
            ],
          },
          "Để chống gửi biểu mẫu tự động (spam), khi bạn đăng ký nhận cẩm nang chúng tôi lưu một mã băm một chiều của địa chỉ IP; mã này không thể dùng để khôi phục địa chỉ IP gốc.",
          "Website không sử dụng cookie quảng cáo hay công cụ theo dõi, phân tích hành vi của bên thứ ba. Trình duyệt của bạn tự lưu giỏ báo giá và trạng thái đóng/mở ô mời nhận cẩm nang ngay trên thiết bị của bạn (localStorage); dữ liệu này không được gửi về máy chủ của chúng tôi và bạn có thể xóa bằng cách xóa dữ liệu trang web trong trình duyệt.",
        ],
      },
      {
        heading: "2. Mục đích sử dụng",
        blocks: [
          {
            list: [
              "Liên hệ, gửi báo giá và tư vấn kỹ thuật theo yêu cầu của bạn.",
              "Gửi cẩm nang và tài liệu kỹ thuật bạn đã đăng ký nhận.",
              "Xử lý đơn hàng, giao hàng, xuất hóa đơn và chăm sóc khách hàng sau bán hàng.",
              "Liên hệ tư vấn sản phẩm phù hợp khi bạn đã đồng ý.",
            ],
          },
          "Chúng tôi không sử dụng thông tin của bạn cho mục đích khác khi chưa có sự đồng ý của bạn, trừ trường hợp pháp luật có quy định khác.",
        ],
      },
      {
        heading: "3. Thời gian lưu trữ",
        blocks: [
          "Thông tin được lưu trong thời gian cần thiết để thực hiện các mục đích nêu trên và nghĩa vụ lưu trữ chứng từ theo quy định, tối đa 05 năm kể từ lần liên hệ hoặc giao dịch gần nhất, hoặc đến khi bạn yêu cầu xóa (nếu pháp luật cho phép).",
        ],
      },
      {
        heading: "4. Chia sẻ thông tin",
        blocks: [
          "Chúng tôi không bán, cho thuê hay trao đổi thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp:",
          {
            list: [
              "Với các nhà cung cấp dịch vụ hạ tầng giúp vận hành website (lưu trữ website và tệp, cơ sở dữ liệu, gửi email), trong phạm vi cần thiết để cung cấp dịch vụ.",
              "Với đơn vị vận chuyển, khi cần giao hàng cho bạn (tên người nhận, số điện thoại, địa chỉ giao hàng).",
              "Với cơ quan nhà nước có thẩm quyền khi có yêu cầu theo quy định của pháp luật.",
            ],
          },
        ],
      },
      {
        heading: "5. Nơi lưu trữ",
        blocks: [
          "Website và dữ liệu được lưu trữ trên hạ tầng điện toán đám mây của Vercel và Neon (máy chủ cơ sở dữ liệu đặt tại Singapore); email được gửi qua dịch vụ của Google. Do đó thông tin của bạn có thể được lưu trữ và xử lý ngoài lãnh thổ Việt Nam; chúng tôi lựa chọn các nhà cung cấp có biện pháp bảo mật phù hợp.",
        ],
      },
      {
        heading: "6. Bảo vệ thông tin",
        blocks: [
          "Website sử dụng kết nối mã hóa HTTPS. Trang quản trị chỉ những nhân viên được phân quyền mới truy cập được, mật khẩu được lưu ở dạng mã hóa. Dù vậy, không có phương thức truyền tải hay lưu trữ nào trên Internet an toàn tuyệt đối; nếu phát hiện sự cố liên quan đến dữ liệu, chúng tôi sẽ xử lý và thông báo theo quy định của pháp luật.",
        ],
      },
      {
        heading: "7. Quyền của bạn",
        blocks: [
          "Bạn có quyền yêu cầu xem, chỉnh sửa, xóa thông tin cá nhân của mình, rút lại sự đồng ý hoặc yêu cầu ngừng nhận thông tin tư vấn, theo quy định của pháp luật Việt Nam về bảo vệ dữ liệu cá nhân. Hãy gửi yêu cầu qua email hoặc hotline ở mục Liên hệ bên dưới; chúng tôi phản hồi trong vòng 05 ngày làm việc.",
        ],
      },
      {
        heading: "8. Thay đổi chính sách",
        blocks: [
          "Chính sách có thể được cập nhật khi chúng tôi thay đổi cách vận hành website hoặc khi pháp luật thay đổi. Phiên bản mới có hiệu lực kể từ ngày đăng trên trang này.",
        ],
      },
    ],
  },
  {
    slug: "dieu-khoan-giao-dich",
    title: "Điều khoản giao dịch",
    titleEn: "Terms of trade",
    titleZh: "交易条款",
    description:
      "Điều kiện sử dụng website và giao dịch mua bán dầu nhớt với Phúc Thọ: báo giá, xác lập đơn hàng, thanh toán, chứng từ và giải quyết tranh chấp.",
    updated: "01/12/2026",
    intro: `Website www.phuctholube.com do ${OWNER} vận hành. Khi sử dụng website hoặc gửi yêu cầu báo giá, bạn đồng ý với các điều khoản dưới đây.`,
    sections: [
      {
        heading: "1. Thông tin sản phẩm trên website",
        blocks: [
          "Mô tả và thông số kỹ thuật sản phẩm được tổng hợp từ tài liệu của nhà sản xuất (TDS, MSDS) và chỉ mang tính tham khảo; hình ảnh có thể khác thực tế về bao bì. Khi chọn dầu cho thiết bị, vui lòng đối chiếu với khuyến cáo của nhà sản xuất thiết bị.",
          "Bảng tra cứu sản phẩm tương đương giữa các thương hiệu chỉ là gợi ý ban đầu, không phải xác nhận thay thế. Vui lòng liên hệ đội ngũ kỹ thuật Phúc Thọ để được xác nhận trước khi thay đổi sản phẩm đang dùng.",
        ],
      },
      {
        heading: "2. Báo giá và đặt hàng",
        blocks: [
          "Website không niêm yết giá và không nhận thanh toán trực tuyến. Bạn chọn sản phẩm vào giỏ báo giá và gửi yêu cầu; Phúc Thọ sẽ liên hệ và gửi báo giá gồm giá, quy cách, thời gian và điều kiện giao hàng.",
          "Báo giá có hiệu lực trong 15 ngày kể từ ngày gửi, trừ khi báo giá ghi khác. Đơn hàng được xác lập khi hai bên xác nhận bằng văn bản (đơn đặt hàng có xác nhận, email xác nhận hoặc hợp đồng mua bán).",
        ],
      },
      {
        heading: "3. Thanh toán và hóa đơn",
        blocks: [
          "Phương thức thanh toán: chuyển khoản vào tài khoản ngân hàng đứng tên Công ty TNHH Thương Mại Phúc Thọ, hoặc tiền mặt khi nhận hàng đối với đơn hàng có giá trị dưới 5.000.000 đồng. Thời hạn thanh toán theo thỏa thuận trong báo giá, đơn hàng hoặc hợp đồng.",
          "Phúc Thọ xuất hóa đơn giá trị gia tăng điện tử cho mỗi đơn hàng theo quy định.",
        ],
      },
      {
        heading: "4. Chất lượng và chứng từ",
        blocks: [
          "Phúc Thọ cung cấp sản phẩm chính hãng của các thương hiệu Shell, Mobil, Total, Castrol. Riêng Shell, Phúc Thọ là đối tác phân phối khu vực thuộc hệ thống của Công ty CP Dịch vụ Phát triển Thị trường C.L — Nhà phân phối tổng được Shell Việt Nam bổ nhiệm.",
          "Giấy chứng nhận xuất xứ (CO) và phiếu chứng nhận phân tích chất lượng theo lô (COA) được cung cấp kèm hàng khi khách hàng yêu cầu.",
        ],
      },
      {
        heading: "5. Giao hàng, đổi trả và bảo mật",
        blocks: [
          "Việc giao nhận, đổi trả và bảo mật thông tin được thực hiện theo Chính sách giao hàng, Chính sách đổi trả và Chính sách bảo mật thông tin đăng trên website.",
        ],
      },
      {
        heading: "6. Sở hữu trí tuệ",
        blocks: [
          "Shell, Mobil, Total, Castrol và các tên sản phẩm liên quan là nhãn hiệu thuộc chủ sở hữu tương ứng, được sử dụng trên website để giới thiệu sản phẩm. Nội dung bài viết, hình ảnh do Phúc Thọ thực hiện thuộc quyền của Phúc Thọ; vui lòng ghi rõ nguồn khi trích dẫn.",
        ],
      },
      {
        heading: "7. Giới hạn trách nhiệm",
        blocks: [
          "Phúc Thọ không chịu trách nhiệm đối với thiệt hại phát sinh do sử dụng sản phẩm sai mục đích, sai hướng dẫn của nhà sản xuất hoặc do bảo quản không đúng sau khi đã giao nhận. Trách nhiệm của Phúc Thọ đối với từng đơn hàng được xác định theo đơn hàng hoặc hợp đồng đã ký.",
        ],
      },
      {
        heading: "8. Luật áp dụng và giải quyết tranh chấp",
        blocks: [
          "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp (nếu có) được ưu tiên giải quyết bằng thương lượng; trường hợp không thương lượng được, một trong hai bên có quyền đưa ra Tòa án có thẩm quyền tại Thành phố Hồ Chí Minh.",
        ],
      },
    ],
  },
  {
    slug: "giao-hang",
    title: "Chính sách giao hàng",
    titleEn: "Delivery policy",
    titleZh: "交货政策",
    description:
      "Phạm vi, thời gian, chi phí giao hàng và cách kiểm tra khi nhận dầu nhớt từ Phúc Thọ.",
    updated: "01/12/2026",
    sections: [
      {
        heading: "1. Phạm vi giao hàng",
        blocks: [
          "Phúc Thọ giao hàng trực tiếp tại khu vực Vũng Tàu, Bà Rịa, Long Điền, Đất Đỏ, Xuyên Mộc và các phường, xã lân cận (TP. Hồ Chí Minh). Với các tỉnh, thành khác, chúng tôi giao qua đơn vị vận chuyển do hai bên thống nhất.",
        ],
      },
      {
        heading: "2. Thời gian giao hàng",
        blocks: [
          {
            list: [
              "Hàng có sẵn, giao trong khu vực trên: 01–02 ngày làm việc kể từ khi đơn hàng được xác nhận.",
              "Giao đi tỉnh khác hoặc hàng cần đặt thêm: thời gian cụ thể được ghi trong báo giá.",
            ],
          },
          "Phúc Thọ giao hàng trong giờ làm việc; nếu cần giao ngoài giờ hoặc theo lịch của nhà máy, vui lòng thông báo khi đặt hàng.",
        ],
      },
      {
        heading: "3. Chi phí giao hàng",
        blocks: [
          "Miễn phí giao hàng tại khu vực Vũng Tàu – Bà Rịa cho đơn hàng từ 01 phuy (209 lít) trở lên; giao đi các tỉnh, thành khác miễn phí cho đơn hàng từ 06 phuy trở lên. Các trường hợp khác, chi phí vận chuyển được báo rõ trong báo giá trước khi bạn xác nhận đơn hàng.",
        ],
      },
      {
        heading: "4. Chuẩn bị khi nhận hàng",
        blocks: [
          "Phuy 209 lít nặng khoảng 180–200 kg. Vui lòng bố trí lối vào cho xe giao hàng và phương tiện bốc dỡ phù hợp (xe nâng, pa-lăng) tại nơi nhận; nếu không có, hãy báo trước để chúng tôi sắp xếp.",
        ],
      },
      {
        heading: "5. Kiểm tra khi nhận hàng",
        blocks: [
          {
            list: [
              "Kiểm tra mã sản phẩm, quy cách, số lượng so với đơn hàng.",
              "Kiểm tra bao bì: niêm phong, nắp, tem nhãn, số lô; phuy/xô không móp méo, không rò rỉ.",
              "Ký biên bản giao nhận. Nếu có sai lệch hoặc hư hỏng, ghi rõ vào biên bản (kèm hình ảnh nếu có) và báo ngay cho Phúc Thọ.",
            ],
          },
        ],
      },
      {
        heading: "6. Chứng từ kèm theo",
        blocks: [
          "Mỗi lần giao hàng có phiếu giao hàng/biên bản giao nhận; hóa đơn giá trị gia tăng điện tử được gửi theo quy định. Giấy chứng nhận xuất xứ (CO) và phiếu chứng nhận phân tích chất lượng theo lô (COA) được cung cấp khi khách hàng yêu cầu.",
        ],
      },
    ],
  },
  {
    slug: "doi-tra",
    title: "Chính sách đổi trả",
    titleEn: "Returns policy",
    titleZh: "退货政策",
    description:
      "Khi nào Phúc Thọ nhận đổi trả dầu nhớt, điều kiện, quy trình và cách hoàn tiền.",
    updated: "01/12/2026",
    sections: [
      {
        heading: "1. Trường hợp được đổi trả",
        blocks: [
          {
            list: [
              "Giao sai mã sản phẩm, quy cách hoặc số lượng so với đơn hàng đã xác nhận.",
              "Bao bì bị hư hỏng, rò rỉ hoặc mất niêm phong trong quá trình vận chuyển của Phúc Thọ.",
              "Sản phẩm có lỗi chất lượng từ nhà sản xuất, được xác nhận qua kiểm tra mẫu hoặc phân tích của phòng thí nghiệm.",
            ],
          },
        ],
      },
      {
        heading: "2. Điều kiện đổi trả",
        blocks: [
          {
            list: [
              "Sai lệch số lượng hoặc hư hỏng bao bì: ghi nhận ngay trong biên bản giao nhận.",
              "Giao sai sản phẩm hoặc lỗi chất lượng: thông báo trong vòng 07 ngày kể từ ngày nhận hàng.",
              "Sản phẩm còn nguyên niêm phong, chưa sử dụng (trừ trường hợp lỗi chất lượng), còn tem nhãn và số lô, kèm chứng từ mua hàng.",
            ],
          },
        ],
      },
      {
        heading: "3. Trường hợp không áp dụng",
        blocks: [
          {
            list: [
              "Sản phẩm đã mở niêm phong hoặc đã sử dụng mà không có lỗi chất lượng.",
              "Hư hỏng do bảo quản không đúng sau khi nhận hàng (để ngoài trời, nhiễm nước, nhiệt độ cao…) hoặc sử dụng sai hướng dẫn.",
              "Đổi trả do khách hàng đổi ý: chỉ xem xét khi hàng còn nguyên niêm phong, trong vòng 07 ngày và khách hàng chịu chi phí vận chuyển.",
            ],
          },
        ],
      },
      {
        heading: "4. Quy trình",
        blocks: [
          {
            list: [
              "Liên hệ Phúc Thọ qua hotline hoặc email, cung cấp số đơn hàng/hóa đơn, mã sản phẩm, số lô và hình ảnh.",
              "Phúc Thọ kiểm tra và phản hồi trong vòng 03 ngày làm việc; với nghi vấn lỗi chất lượng, chúng tôi có thể lấy mẫu để phân tích.",
              "Sau khi xác nhận, Phúc Thọ đổi sản phẩm đúng hoặc hoàn tiền theo thỏa thuận.",
            ],
          },
        ],
      },
      {
        heading: "5. Chi phí và hoàn tiền",
        blocks: [
          "Với lỗi do Phúc Thọ hoặc nhà sản xuất, Phúc Thọ chịu toàn bộ chi phí vận chuyển đổi trả. Tiền hoàn lại được chuyển khoản trong vòng 07 ngày làm việc kể từ khi Phúc Thọ nhận lại hàng; hóa đơn được điều chỉnh theo quy định.",
        ],
      },
    ],
  },
];

export function policyTitle(policy: Policy, locale: string) {
  if (locale === "en") return policy.titleEn;
  if (locale === "zh") return policy.titleZh;
  return policy.title;
}

export function getPolicy(slug: string) {
  return POLICIES.find((p) => p.slug === slug);
}
