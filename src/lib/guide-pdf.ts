import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// The handbook's cover ends with "Trân trọng gửi tặng Quý khách hàng: ____".
// Position measured from the current file (A4, PDF origin bottom-left): the
// blank line runs from x≈212 to x≈440 at y≈64, so the name sits just above it.
// Only files built from the same template are stamped (matched by their PDF
// title); a redesigned handbook is sent untouched until these are re-measured.
const TEMPLATE_TITLE_PREFIX = "Cẩm nang bảo quản và vận hành dầu nhớt";
const NAME_X = 215;
const NAME_BASELINE_Y = 66.5;
const NAME_MAX_WIDTH = 222;
const FONT_SIZE = 10;
const MIN_FONT_SIZE = 8;
const NAVY = rgb(0x0f / 255, 0x2a / 255, 0x44 / 255);

// Shipped with every route via outputFileTracingIncludes in next.config.ts
// (server actions run in whichever page function the visitor is on).
const FONT_PATH = path.join(process.cwd(), "src", "assets", "fonts", "BeVietnamPro-SemiBold.ttf");

let fontBytes: Buffer | null = null;

async function loadFont() {
  fontBytes ??= await readFile(FONT_PATH);
  return fontBytes;
}

function fitText(text: string, font: PDFFont) {
  for (let size = FONT_SIZE; size >= MIN_FONT_SIZE; size -= 0.5) {
    if (font.widthOfTextAtSize(text, size) <= NAME_MAX_WIDTH) return { text, size };
  }
  const fits = (s: string) => font.widthOfTextAtSize(`${s}…`, MIN_FONT_SIZE) <= NAME_MAX_WIDTH;
  // Drop whole words first so the line doesn't end mid-word; only cut inside
  // a word when a single word is wider than the line.
  const words = text.split(" ");
  while (words.length > 1 && !fits(words.join(" "))) words.pop();
  let truncated = words.join(" ").replace(/[\s·,\-–]+$/, "");
  while (truncated.length > 1 && !fits(truncated)) truncated = truncated.slice(0, -1);
  return { text: `${truncated}…`, size: MIN_FONT_SIZE };
}

/**
 * Writes the recipient on the cover's dedication line. Returns null when the
 * file isn't the known template, so the caller sends the original instead.
 */
export async function personalizeGuidePdf(
  pdfBytes: Uint8Array,
  recipient: string
): Promise<Uint8Array | null> {
  const doc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  if (!doc.getTitle()?.startsWith(TEMPLATE_TITLE_PREFIX)) return null;

  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await loadFont(), { subset: true });

  // NFC so decomposed Vietnamese input (base letter + combining marks) maps to
  // the font's precomposed glyphs; drop anything the font can't draw.
  const supported = new Set(font.getCharacterSet());
  const clean = Array.from(recipient.normalize("NFC"))
    .filter((ch) => /\s/.test(ch) || supported.has(ch.codePointAt(0)!))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return null;

  const { text, size } = fitText(clean, font);
  doc.getPage(0).drawText(text, {
    x: NAME_X,
    y: NAME_BASELINE_Y,
    size,
    font,
    color: NAVY,
  });

  return doc.save();
}
