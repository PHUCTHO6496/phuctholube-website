"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, X } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { requestGuide, type GuideFormState } from "@/lib/actions/guide-lead";

const STORAGE_KEY = "pt-guide-popup";
const SHOW_AFTER_MS = 20_000;
const SHOW_AFTER_SCROLL = 0.5;
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

// Pages where a popup would get in the way of a visitor who is already
// converting (filling in a quote request).
const HIDDEN_PATH_PREFIXES = ["/bao-gia"];

type Stored = { dismissedAt?: number; submittedAt?: number };

function readStored(): Stored {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

function writeStored(patch: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStored(), ...patch }));
  } catch {
    // Private mode / storage disabled: the popup just shows again next visit.
  }
}

const initialState: GuideFormState = { status: "idle" };

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base focus:border-blue-600 focus:outline-none sm:text-sm";

export function LeadGuidePopup() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("leadGuide");
  const titleId = useId();

  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(requestGuide, initialState);
  const nameRef = useRef<HTMLInputElement>(null);

  const enabled =
    locale === "vi" && !HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!enabled || visible) return;
    const stored = readStored();
    if (stored.submittedAt) return;
    if (stored.dismissedAt && Date.now() - stored.dismissedAt < SNOOZE_MS) return;

    const show = () => setVisible(true);
    const timer = window.setTimeout(show, SHOW_AFTER_MS);
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SHOW_AFTER_SCROLL) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, visible]);

  useEffect(() => {
    if (state.status === "success") writeStored({ submittedAt: Date.now() });
  }, [state.status]);

  useEffect(() => {
    if (expanded) nameRef.current?.focus();
  }, [expanded]);

  if (!enabled || !visible) return null;

  const close = () => {
    if (state.status !== "success") writeStored({ dismissedAt: Date.now() });
    setVisible(false);
  };

  const values = state.values;
  const fieldError = (field: string) => state.errors?.[field]?.[0];

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
      className="fixed bottom-5 left-3 right-20 z-50 max-h-[calc(100dvh-2.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl motion-safe:animate-slide-up sm:left-5 sm:right-auto sm:w-[360px]"
    >
      <button
        type="button"
        onClick={close}
        aria-label={t("close")}
        className="absolute right-2 top-2 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 rounded-t-xl bg-blue-900 px-4 py-3 pr-10 text-white">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <h2 id={titleId} className="text-sm font-bold leading-snug">
            {t("title")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-blue-100">{t("description")}</p>
        </div>
      </div>

      <div className="p-4">
        {state.status === "success" ? (
          <div className="flex items-start gap-2 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <p>{state.message ?? t("success", { email: state.email ?? "" })}</p>
          </div>
        ) : (
          <>
            {/* Start as a compact teaser on every screen size — the full form
                would cover most of a laptop screen — and expand on request. */}
            {!expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                {t("teaserCta")}
              </button>
            )}

            <form action={formAction} className={expanded ? "space-y-3" : "hidden"}>
              {/* Honeypot — hidden from people and assistive tech. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div>
                <label htmlFor="guide-name" className="block text-xs font-medium text-slate-700">
                  {t("name")} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  id="guide-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  defaultValue={values?.name}
                  className={inputClass}
                />
                {fieldError("name") && (
                  <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>
                )}
              </div>

              <div>
                <label htmlFor="guide-email" className="block text-xs font-medium text-slate-700">
                  {t("email")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="guide-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={values?.email}
                  className={inputClass}
                />
                {fieldError("email") && (
                  <p className="mt-1 text-xs text-red-600">{fieldError("email")}</p>
                )}
              </div>

              <div>
                <label htmlFor="guide-phone" className="block text-xs font-medium text-slate-700">
                  {t("phone")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="guide-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  defaultValue={values?.phone}
                  className={inputClass}
                />
                {fieldError("phone") && (
                  <p className="mt-1 text-xs text-red-600">{fieldError("phone")}</p>
                )}
              </div>

              <div>
                <label htmlFor="guide-company" className="block text-xs font-medium text-slate-700">
                  {t("company")}
                </label>
                <input
                  id="guide-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  defaultValue={values?.company}
                  className={inputClass}
                />
                {fieldError("company") && (
                  <p className="mt-1 text-xs text-red-600">{fieldError("company")}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    defaultChecked={values?.consent}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-900"
                  />
                  <span>{t("consent")}</span>
                </label>
                {fieldError("consent") && (
                  <p className="mt-1 text-xs text-red-600">{fieldError("consent")}</p>
                )}
              </div>

              {state.status === "error" && state.message && (
                <p className="text-xs text-red-600">{state.message}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
              >
                {pending ? t("sending") : t("submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
