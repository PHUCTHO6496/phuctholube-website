"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  compare,
  defaultInputs,
  EQUIPMENT_KINDS,
  type EquipmentKind,
  type OptionInputs,
  type SharedInputs,
} from "@/lib/cost-calculator";
import { submitCostEstimate, type CostEstimateState } from "@/lib/actions/cost-estimate";

export type CalculatorProduct = {
  slug: string;
  name: string;
  kind: EquipmentKind;
  /** Oil change interval stated on the product's TDS, already localized. */
  tdsInterval: string | null;
};

type KindState = { shared: SharedInputs; current: OptionInputs; proposed: OptionInputs };

const LOCALE_TAG: Record<string, string> = { vi: "vi-VN", en: "en-US", zh: "zh-CN" };

function initialState(kind: EquipmentKind, proposedProduct = ""): KindState {
  const d = defaultInputs(kind);
  return {
    shared: d.shared,
    current: { ...d.option, product: "" },
    proposed: { ...d.option, product: proposedProduct },
  };
}

/** Vietnamese writes 1.500.000,5; English and Chinese pages write 1,500,000.5. */
function parseNumber(text: string, locale: string) {
  const normalized =
    locale === "vi" ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  const value = Number.parseFloat(normalized.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  compact = false,
  ariaLabel,
}: {
  id: string;
  label?: string;
  value: number;
  onChange: (value: number) => void;
  hint?: React.ReactNode;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const locale = useLocale();
  const [draft, setDraft] = useState<string | null>(null);
  const shown =
    draft ??
    (value ? new Intl.NumberFormat(LOCALE_TAG[locale] ?? "vi-VN", { maximumFractionDigits: 2 }).format(value) : "");
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={shown}
        placeholder="0"
        onFocus={() => setDraft(shown)}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(parseNumber(e.target.value, locale));
        }}
        onBlur={() => setDraft(null)}
        className={cn(
          "w-full rounded-md border border-slate-300 px-3 py-2 text-right text-sm tabular-nums focus:border-blue-600 focus:outline-none",
          label && "mt-1",
          compact && "py-1.5"
        )}
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function CostCalculator({
  products,
  initialKind,
  initialProposed,
}: {
  products: CalculatorProduct[];
  initialKind: EquipmentKind;
  initialProposed?: string;
}) {
  const t = useTranslations("costCalculator");
  const locale = useLocale();
  const [kind, setKind] = useState<EquipmentKind>(initialKind);
  const [states, setStates] = useState<Partial<Record<EquipmentKind, KindState>>>(() => ({
    [initialKind]: initialState(initialKind, initialProposed),
  }));
  const state = states[kind] ?? initialState(kind);
  const update = (patch: (s: KindState) => KindState) =>
    setStates((all) => ({ ...all, [kind]: patch(all[kind] ?? initialState(kind)) }));
  const setShared = (key: keyof SharedInputs) => (value: number) =>
    update((s) => ({ ...s, shared: { ...s.shared, [key]: value } }));
  const setOption = (side: "current" | "proposed", key: keyof OptionInputs) => (value: number | string) =>
    update((s) => ({ ...s, [side]: { ...s[side], [key]: value } }));

  // Field labels that read differently for a fleet or for grease.
  const label = (group: "fields" | "rows", key: string) => {
    const variant = kind === "fleet" ? "Fleet" : kind === "grease" ? "Grease" : "";
    return variant && t.has(`${group}.${key}${variant}`) ? `${group}.${key}${variant}` : `${group}.${key}`;
  };
  const f = (key: string) => t(label("fields", key) as "fields.units");

  const result = compare(kind, state.shared, state.current, state.proposed);
  const money = (v: number) =>
    `${new Intl.NumberFormat(LOCALE_TAG[locale] ?? "vi-VN", { maximumFractionDigits: 0 }).format(Math.round(v))} ${t("currency")}`;
  const count = (v: number) =>
    new Intl.NumberFormat(LOCALE_TAG[locale] ?? "vi-VN", { maximumFractionDigits: 1 }).format(v);
  const pct = (v: number) => `${count(Math.abs(v))}%`;

  const kindProducts = products.filter((p) => p.kind === kind);
  const units = Math.max(1, Math.round(state.shared.units || 0));

  const optionRow = (key: keyof OptionInputs, hint?: React.ReactNode) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_9rem_9rem] sm:items-start">
      <p className="col-span-2 text-xs font-medium text-slate-600 sm:col-span-1 sm:pt-2">{f(key)}</p>
      {(["current", "proposed"] as const).map((side) => (
        <div key={side}>
          {/* Column headings are only shown from the sm breakpoint up. */}
          <span className={cn("block text-[11px] sm:hidden", side === "proposed" ? "text-blue-900" : "text-slate-500")}>
            {t(side)}
          </span>
          <NumberField
            id={`${kind}-${side}-${key}`}
            ariaLabel={`${f(key)} – ${t(side)}`}
            value={state[side][key] as number}
            onChange={setOption(side, key)}
            compact
          />
        </div>
      ))}
      {hint && <p className="col-span-2 text-xs text-slate-500 sm:col-span-3">{hint}</p>}
    </div>
  );

  const rows: { key: string; current: number; proposed: number; isMoney?: boolean }[] = [
    { key: "lubricant", current: result.current.lubricant, proposed: result.proposed.lubricant, isMoney: true },
    { key: "service", current: result.current.service, proposed: result.proposed.service, isMoney: true },
    { key: "serviceDowntime", current: result.current.serviceDowntime, proposed: result.proposed.serviceDowntime, isMoney: true },
    { key: "repairs", current: result.current.repairs, proposed: result.proposed.repairs, isMoney: true },
    { key: "energy", current: result.current.energy, proposed: result.proposed.energy, isMoney: true },
  ];
  const max = Math.max(result.currentFleet, result.proposedFleet, 1);
  const noPrice = !state.current.price || !state.proposed.price;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2" role="tablist">
        {EQUIPMENT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === kind}
            onClick={() => setKind(k)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              k === kind
                ? "border-blue-900 bg-blue-900 text-white"
                : "border-slate-300 text-slate-700 hover:border-blue-900 hover:text-blue-900"
            )}
          >
            {t(`kinds.${k}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-900">{t("sharedTitle")}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(["units", "usage", "fill", "laborRate", "downtimeRate", "hoursPerChange", "partsPerChange"] as const).map(
                (key) => (
                  <NumberField
                    key={key}
                    id={`${kind}-${key}`}
                    label={f(key)}
                    value={state.shared[key]}
                    onChange={setShared(key)}
                  />
                )
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-900">{t("optionsTitle")}</h2>
            <div className="mt-4 space-y-3">
              <div className="hidden gap-2 sm:grid sm:grid-cols-[1fr_9rem_9rem]">
                <span />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("current")}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-900">{t("proposed")}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["current", "proposed"] as const).map((side) => {
                  const selected = kindProducts.find((p) => p.slug === state[side].product);
                  return (
                    <div key={side}>
                      <label htmlFor={`${kind}-${side}-product`} className="block text-xs font-medium text-slate-600">
                        {f("product")} · {t(side)}
                      </label>
                      <select
                        id={`${kind}-${side}-product`}
                        value={state[side].product}
                        onChange={(e) => setOption(side, "product")(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                      >
                        <option value="">{t("otherProduct")}</option>
                        {kindProducts.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {selected && (
                        <p className="mt-1 text-xs text-slate-500">
                          {selected.tdsInterval && <>{t("tdsHint", { value: selected.tdsInterval })} · </>}
                          <Link href={`/san-pham/${selected.slug}`} className="font-semibold text-blue-900 hover:text-amber-600">
                            {t("viewProduct")}
                          </Link>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {optionRow("price", t("priceHint"))}
              {optionRow("interval", t("intervalHint"))}
              {kind !== "grease" && optionRow("topUp")}
            </div>
          </section>

          <details className="group rounded-xl border border-slate-200 p-5">
            <summary className="cursor-pointer text-base font-bold text-slate-900">
              {t("optionalTitle")}
              <span className="block text-xs font-normal text-slate-500">{t("optionalHint")}</span>
            </summary>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(["repairCost", "repairHours", "energyUse", "energyPrice"] as const).map((key) => (
                <NumberField
                  key={key}
                  id={`${kind}-${key}`}
                  label={f(key)}
                  value={state.shared[key]}
                  onChange={setShared(key)}
                />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <div className="hidden gap-2 sm:grid sm:grid-cols-[1fr_9rem_9rem]">
                <span />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("current")}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-900">{t("proposed")}</span>
              </div>
              {optionRow("failures")}
              {optionRow("energySaving", t("energyHint"))}
            </div>
          </details>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-base font-bold text-slate-900">{t("resultsTitle")}</h2>
            <p
              className={cn(
                "mt-3 rounded-lg p-3 text-sm font-semibold",
                result.savingFleet > 0.5
                  ? "bg-emerald-50 text-emerald-800"
                  : result.savingFleet < -0.5
                    ? "bg-amber-50 text-amber-800"
                    : "bg-white text-slate-600"
              )}
            >
              {result.savingFleet > 0.5
                ? t("summarySaving", { amount: money(result.savingFleet), pct: pct(result.savingPct) })
                : result.savingFleet < -0.5
                  ? t("summaryMore", { amount: money(-result.savingFleet), pct: pct(result.savingPct) })
                  : t("summaryEqual")}
            </p>

            <div className="mt-4 space-y-2">
              {(["current", "proposed"] as const).map((side) => {
                const value = side === "current" ? result.currentFleet : result.proposedFleet;
                return (
                  <div key={side}>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{t(side)}</span>
                      <span className="font-semibold tabular-nums text-slate-900">{money(value)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-200">
                      <div
                        className={cn("h-2 rounded-full", side === "current" ? "bg-slate-500" : "bg-blue-900")}
                        style={{ width: `${(value / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-slate-500">
                {t(label("rows", "total") as "rows.total", { units: String(units) })}
              </p>
            </div>

            <table className="mt-5 w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2 font-medium" />
                  <th className="pb-2 text-right font-medium">{t("current")}</th>
                  <th className="pb-2 text-right font-medium text-blue-900">{t("proposed")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="py-1.5 pr-2 text-slate-600">{t(label("rows", r.key) as "rows.lubricant")}</td>
                    <td className="py-1.5 text-right tabular-nums">{money(r.current)}</td>
                    <td className="py-1.5 text-right tabular-nums">{money(r.proposed)}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-slate-900">
                  <td className="py-1.5 pr-2">{t(label("rows", "perUnit") as "rows.perUnit")}</td>
                  <td className="py-1.5 text-right tabular-nums">{money(result.current.total)}</td>
                  <td className="py-1.5 text-right tabular-nums">{money(result.proposed.total)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-2 text-slate-600">{t(label("rows", "changes") as "rows.changes")}</td>
                  <td className="py-1.5 text-right tabular-nums">{count(result.current.changesPerYear)}</td>
                  <td className="py-1.5 text-right tabular-nums">{count(result.proposed.changesPerYear)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-2 text-slate-600">{t("rows.downtime")}</td>
                  <td className="py-1.5 text-right tabular-nums">{count(result.current.downtimeHours)}</td>
                  <td className="py-1.5 text-right tabular-nums">{count(result.proposed.downtimeHours)}</td>
                </tr>
              </tbody>
            </table>

            {noPrice && <p className="mt-3 text-xs font-medium text-amber-700">{t("noPrice")}</p>}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
          </div>
        </aside>
      </div>

      <SendResults inputs={{ kind, ...state }} />
    </div>
  );
}

const initialSendState: CostEstimateState = { status: "idle" };

function SendResults({ inputs }: { inputs: { kind: EquipmentKind } & KindState }) {
  const t = useTranslations("costCalculator.send");
  const [state, action, pending] = useActionState(submitCostEstimate, initialSendState);
  const field = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none";

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{t("title")}</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">{t("text")}</p>
      {state.status === "success" ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {t("success")}
        </p>
      ) : (
        <form action={action} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="hidden" name="inputs" value={JSON.stringify(inputs)} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div>
            <label htmlFor="cc-name" className="block text-sm font-medium text-slate-700">{t("name")}</label>
            <input id="cc-name" name="name" required className={field} />
            {state.errors?.name && <p className="mt-1 text-xs text-red-600">{t("errorName")}</p>}
          </div>
          <div>
            <label htmlFor="cc-company" className="block text-sm font-medium text-slate-700">{t("company")}</label>
            <input id="cc-company" name="company" className={field} />
          </div>
          <div>
            <label htmlFor="cc-phone" className="block text-sm font-medium text-slate-700">{t("phone")}</label>
            <input id="cc-phone" name="phone" type="tel" required className={field} />
            {state.errors?.phone && <p className="mt-1 text-xs text-red-600">{t("errorPhone")}</p>}
          </div>
          <div>
            <label htmlFor="cc-email" className="block text-sm font-medium text-slate-700">{t("email")}</label>
            <input id="cc-email" name="email" type="email" className={field} />
            {state.errors?.email && <p className="mt-1 text-xs text-red-600">{t("errorEmail")}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cc-note" className="block text-sm font-medium text-slate-700">{t("note")}</label>
            <textarea id="cc-note" name="note" rows={3} className={field} />
          </div>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              <Link href="/chinh-sach/bao-mat-thong-tin" className="hover:text-blue-900 hover:underline">
                {t("privacy")}
              </Link>
            </p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
            >
              {pending ? t("sending") : t("submit")}
            </button>
          </div>
          {state.errors?.inputs && <p className="text-xs text-red-600 sm:col-span-2">{t("errorInputs")}</p>}
        </form>
      )}
    </section>
  );
}
