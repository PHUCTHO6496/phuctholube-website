// English rendering of spec values. Spec rows are transcribed from Shell's
// Vietnamese TDS, so values carry Vietnamese units and phrases ("20 phút",
// "tối thiểu 315 kg", "Dầu khoáng"). There's no per-value English column;
// the vocabulary is small and repetitive, so English pages translate it here.

const PHRASES: [RegExp, string][] = [
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

export function localizeSpecValue(value: string, locale: string): string {
  if (locale !== "en") return value;
  return PHRASES.reduce((v, [re, rep]) => v.replace(re, rep), value.normalize("NFC"));
}
