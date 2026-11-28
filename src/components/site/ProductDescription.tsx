import { parseDescription } from "@/lib/description";

export function ProductDescription({ text }: { text: string }) {
  return (
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
      {parseDescription(text).map((block, i) => {
        switch (block.kind) {
          case "h3":
            return (
              <h3 key={i} className="pt-3 text-base font-bold text-slate-900">
                {block.text}
              </h3>
            );
          case "h4":
            return (
              <h4 key={i} className="pt-1 font-semibold text-slate-800">
                {block.text}
              </h4>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{block.text}</p>;
        }
      })}
    </div>
  );
}
