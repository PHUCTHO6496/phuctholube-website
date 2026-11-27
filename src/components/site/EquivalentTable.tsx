import { Link } from "@/i18n/navigation";

export type EquivalentRow = {
  grade: string;
  /** Brand name -> listings of that brand at this grade. */
  byBrand: Record<string, { slug: string; label: string }[]>;
};

export type EquivalentSection = { category: string; rows: EquivalentRow[] };

/**
 * Plain server-rendered cross-reference of the same data the interactive
 * finder uses. The finder's <select> is invisible to search engines; this
 * table gives every pairing ("Mobil DTE 26 ↔ Shell Tellus S2 MX 68") a real
 * link they can follow and index.
 */
export function EquivalentTable({
  sections,
  brands,
  title,
  intro,
  gradeLabel,
}: {
  sections: EquivalentSection[];
  brands: string[];
  title: string;
  intro: string;
  gradeLabel: string;
}) {
  if (sections.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-200 pt-10">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{intro}</p>

      <div className="mt-8 space-y-10">
        {sections.map((section) => (
          <div key={section.category}>
            <h3 className="text-lg font-bold text-slate-900">{section.category}</h3>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      {gradeLabel}
                    </th>
                    {brands.map((brand) => (
                      <th key={brand} scope="col" className="px-4 py-3 font-semibold">
                        {brand}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {section.rows.map((row) => (
                    <tr key={row.grade} className="align-top">
                      <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                        {row.grade}
                      </th>
                      {brands.map((brand) => (
                        <td key={brand} className="px-4 py-3">
                          {(row.byBrand[brand] ?? []).length === 0 ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {row.byBrand[brand].map((item) => (
                                <li key={item.slug}>
                                  <Link
                                    href={`/san-pham/${item.slug}`}
                                    className="text-blue-900 hover:text-amber-600 hover:underline"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
