/**
 * Product descriptions are plain text typed in admin, with a few markers:
 *   blank line   -> new paragraph
 *   "## Title"   -> section heading
 *   "### Title"  -> sub-heading (FAQ questions)
 *   "- item"     -> bullet list
 * Anything else is shown as typed, so older one-paragraph descriptions
 * render exactly as before.
 */
export type DescriptionBlock =
  | { kind: "h3" | "h4" | "p"; text: string }
  | { kind: "ul"; items: string[] };

export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  for (const chunk of text.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    const flush = () => {
      if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    };
    for (const line of lines) {
      if (line.startsWith("### ")) {
        flush();
        blocks.push({ kind: "h4", text: line.slice(4) });
      } else if (line.startsWith("## ")) {
        flush();
        blocks.push({ kind: "h3", text: line.slice(3) });
      } else if (line.startsWith("- ")) {
        flush();
        const last = blocks[blocks.length - 1];
        if (last?.kind === "ul") last.items.push(line.slice(2));
        else blocks.push({ kind: "ul", items: [line.slice(2)] });
      } else {
        para.push(line);
      }
    }
    flush();
  }
  return blocks;
}

