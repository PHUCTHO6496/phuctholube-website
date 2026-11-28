// English and Chinese rendering of spec values. Spec rows are transcribed
// from Shell's Vietnamese TDS, so values carry Vietnamese units and phrases
// ("20 phút", "tối thiểu 315 kg", "Dầu khoáng"). There's no per-value
// translation column; the vocabulary is small and repetitive, so translated
// pages convert it here. Order matters: whole values and long phrases first.

const PHRASES_EN: [RegExp, string][] = [
  // Whole values / long phrases first.
  [/^Dầu khoáng nhóm II$/, "Group II mineral oil"],
  [/^Dầu khoáng parafin tinh chế$/, "Refined paraffinic mineral oil"],
  [/^Dầu khoáng tinh chế$/, "Refined mineral oil"],
  [/^Dầu khoáng chỉ số độ nhớt cao$/, "High-VI mineral oil"],
  [/^Dầu khoáng trắng \(white mineral oil\)$/, "White mineral oil"],
  [/^(Dầu gốc khoáng|Dầu khoáng|Khoáng)$/, "Mineral oil"],
  [/^Tổng hợp polyalkylene glycol \(PAG\)$/, "Synthetic polyalkylene glycol (PAG)"],
  [/^Tổng hợp PAO \(polyalphaolefin\)$/, "Synthetic PAO (polyalphaolefin)"],
  [/^Tổng hợp \(công nghệ GTL\)$/, "Synthetic (GTL technology)"],
  [/^(Dầu gốc công nghệ GTL|Công nghệ GTL)$/, "GTL base oil technology"],
  [/^Công nghệ dầu gốc tổng hợp$/, "Synthetic base oil technology"],
  [/^Tổng hợp hoàn toàn$/, "Fully synthetic"],
  [/^Bán tổng hợp$/, "Semi-synthetic"],
  [/^Tổng hợp$/, "Synthetic"],
  [/^Nước – glycol \(chất lỏng thủy lực chống cháy HFC\)$/, "Water-glycol (HFC fire-resistant hydraulic fluid)"],
  [/^Lithium phức hợp$/, "Lithium complex"],
  [/^Nhôm phức hợp \(Al complex\)$/, "Aluminium complex"],
  [/^Không ăn mòn$/, "Non-corrosive"],
  [/^Phù hợp xe yêu cầu GM Dexron III, Ford Mercon, Allison C-4$/, "Suitable where GM Dexron III, Ford Mercon or Allison C-4 is specified"],
  [/IEC 60296 \(2012\) Bảng 2 – dầu máy biến áp ức chế oxy hóa \(I\), mục 7\.1 \(độ ổn định oxy hóa cao & hàm lượng lưu huỳnh thấp\)/,
    "IEC 60296 (2012) Table 2 – inhibited transformer oil (I), section 7.1 (high oxidation stability & low sulphur)"],
  // Phrases inside approval lists.
  [/\(hộp số Flender\)/g, "(Flender gearboxes)"],
  [/chấp thuận hoàn toàn bởi/g, "fully approved by"],
  [/Được chấp thuận bởi:/g, "Approved by:"],
  [/\(phù hợp ứng dụng yêu cầu\)/g, "(suitable where specified)"],
  [/\(đáp ứng yêu cầu\)/g, "(meets requirements)"],
  [/\(đáp ứng (?:chỉ tiêu|tiêu chuẩn)\)/g, "(meets specification)"],
  [/\(trước đây\)/g, "(formerly)"],
  [/\(dầu máy xeo giấy\)/g, "(paper machine oils)"],
  [/FZG cấp tải/g, "FZG load stage"],
  [/\(tiếp xúc trực tiếp thực phẩm\)/g, "(direct food contact)"],
  [/\(tiếp xúc gián tiếp thực phẩm\)/g, "(indirect food contact)"],
  [/theo nhóm nhiên liệu ghi trong TDS/g, "per fuel class in the TDS"],
  [/turbocharger VTR, chu kỳ thay dầu tối đa ([\d,.]+) giờ/g, "VTR turbochargers, oil change interval up to $1 hours"],
  [/ và /g, " and "],
  // Qualifiers and units.
  [/\(giảm độ nhớt ở (\d+)°C\)/g, "(viscosity loss at $1°C)"],
  [/\(ở (\d+)°C\)/g, "(at $1°C)"],
  [/\(đỉnh ([^)]+)\)/g, "(peak $1)"],
  [/^tối thiểu /, "min. "],
  [/^tối đa /, "max. "],
  [/^đến /, "up to "],
  [/ đến /g, " to "],
  [/% khối lượng/g, "% by mass"],
  [/\((\d+) giờ\)/g, "($1 hours)"],
  // No \b: it's ASCII-only, and "ờ" isn't a word character to it.
  [/ giờ(?=$|[\s),;])/g, " hours"],
  [/ phút\b/g, " min"],
  [/\(đạt\)/g, "(pass)"],
  [/^Đạt\b/, "Pass"],
];

const PHRASES_ZH: [RegExp, string][] = [
  [/^Dầu khoáng nhóm II$/, "II 类矿物油"],
  [/^Dầu khoáng parafin tinh chế$/, "精制石蜡基矿物油"],
  [/^Dầu khoáng tinh chế$/, "精制矿物油"],
  [/^Dầu khoáng chỉ số độ nhớt cao$/, "高粘度指数矿物油"],
  [/^Dầu khoáng trắng \(white mineral oil\)$/, "白矿油"],
  [/^(Dầu gốc khoáng|Dầu khoáng|Khoáng)$/, "矿物油"],
  [/^Tổng hợp polyalkylene glycol \(PAG\)$/, "合成聚醚（PAG）"],
  [/^Tổng hợp PAO \(polyalphaolefin\)$/, "合成 PAO（聚α烯烃）"],
  [/^Tổng hợp \(công nghệ GTL\)$/, "合成（GTL 技术）"],
  [/^(Dầu gốc công nghệ GTL|Công nghệ GTL)$/, "GTL 基础油技术"],
  [/^Công nghệ dầu gốc tổng hợp$/, "合成基础油技术"],
  [/^Tổng hợp hoàn toàn$/, "全合成"],
  [/^Bán tổng hợp$/, "半合成"],
  [/^Tổng hợp$/, "合成"],
  [/^Nước – glycol \(chất lỏng thủy lực chống cháy HFC\)$/, "水-乙二醇（HFC 难燃液压液）"],
  [/^Lithium phức hợp$/, "复合锂基"],
  [/^Nhôm phức hợp \(Al complex\)$/, "复合铝基"],
  [/^Không ăn mòn$/, "无腐蚀性"],
  [/^Phù hợp xe yêu cầu GM Dexron III, Ford Mercon, Allison C-4$/, "适用于要求 GM Dexron III、Ford Mercon 或 Allison C-4 的车辆"],
  [/IEC 60296 \(2012\) Bảng 2 – dầu máy biến áp ức chế oxy hóa \(I\), mục 7\.1 \(độ ổn định oxy hóa cao & hàm lượng lưu huỳnh thấp\)/,
    "IEC 60296 (2012) 表 2 – 含抑制剂变压器油 (I)，第 7.1 条（高氧化安定性和低硫含量）"],
  [/\(hộp số Flender\)/g, "（Flender 齿轮箱）"],
  [/chấp thuận hoàn toàn bởi (.+)$/, "获 $1 完全认可"],
  [/Được chấp thuận bởi:/g, "获以下厂商认可："],
  [/\(phù hợp ứng dụng yêu cầu\)/g, "（适用于有此要求的场合）"],
  [/\(đáp ứng yêu cầu\)/g, "（满足要求）"],
  [/\(đáp ứng (?:chỉ tiêu|tiêu chuẩn)\)/g, "（满足规格）"],
  [/\(trước đây\)/g, "（旧规格）"],
  [/\(dầu máy xeo giấy\)/g, "（造纸机油）"],
  [/FZG cấp tải/g, "FZG 载荷级"],
  [/\(tiếp xúc trực tiếp thực phẩm\)/g, "（直接接触食品）"],
  [/\(tiếp xúc gián tiếp thực phẩm\)/g, "（间接接触食品）"],
  [/theo nhóm nhiên liệu ghi trong TDS/g, "按 TDS 所列燃气类别"],
  [/turbocharger VTR, chu kỳ thay dầu tối đa ([\d,.]+) giờ/g, "VTR 涡轮增压器，换油周期最长 $1 小时"],
  [/ và /g, " 和 "],
  [/\(giảm độ nhớt ở (\d+)°C\)/g, "（$1°C 粘度下降）"],
  [/\(ở (\d+)°C\)/g, "（$1°C 时）"],
  [/\(đỉnh ([^)]+)\)/g, "（峰值 $1）"],
  [/^tối thiểu /, "≥ "],
  [/^tối đa /, "≤ "],
  [/^đến ([\d,.]+) giờ$/, "可达 $1 小时"],
  [/^đến /, "最高 "],
  [/ đến /g, " 至 "],
  [/ ?% khối lượng/g, "%（质量分数）"],
  [/\((\d+) giờ\)/g, "（$1 小时）"],
  [/ giờ(?=$|[\s),;])/g, " 小时"],
  [/ phút\b/g, " 分钟"],
  [/\(đạt\)/g, "（通过）"],
  [/^Đạt\b/, "通过"],
  // Full-width brackets carry their own spacing.
  [/ （/g, "（"],
];

const PHRASES: Record<string, [RegExp, string][]> = { en: PHRASES_EN, zh: PHRASES_ZH };

export function localizeSpecValue(value: string, locale: string): string {
  const phrases = PHRASES[locale];
  if (!phrases) return value;
  return phrases.reduce((v, [re, rep]) => v.replace(re, rep), value.normalize("NFC"));
}
