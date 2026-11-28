/**
 * Yearly operating cost of a lubricant on a piece of equipment, so a
 * customer can compare what they use now with an alternative. Every number
 * comes from the customer's own inputs — nothing here assumes a product
 * performs better than another.
 *
 * Shared by the calculator page (client) and the "send results" action
 * (server), so no server-only imports.
 */

export const EQUIPMENT_KINDS = ["compressor", "gearbox", "hydraulic", "grease", "fleet"] as const;
export type EquipmentKind = (typeof EQUIPMENT_KINDS)[number];

/** Product category whose products are offered for each kind of equipment. */
export const KIND_CATEGORY: Record<EquipmentKind, string> = {
  compressor: "dau-may-nen-khi",
  gearbox: "dau-banh-rang",
  hydraulic: "dau-thuy-luc",
  grease: "mo-boi-tron",
  fleet: "dau-dong-co-diesel",
};

export function kindForCategory(categorySlug: string | null | undefined): EquipmentKind | null {
  const entry = Object.entries(KIND_CATEGORY).find(([, slug]) => slug === categorySlug);
  return entry ? (entry[0] as EquipmentKind) : null;
}

export function isEquipmentKind(value: unknown): value is EquipmentKind {
  return typeof value === "string" && (EQUIPMENT_KINDS as readonly string[]).includes(value);
}

/** Inputs describing the equipment and how it is run — the same for both options. */
export type SharedInputs = {
  /** Number of machines (or vehicles). */
  units: number;
  /** Operating hours per year (km per year for a fleet). */
  usage: number;
  /** Oil per change, litres (grease per relubrication, kg). */
  fill: number;
  /** Labour cost, VND per hour. */
  laborRate: number;
  /** Loss while the machine is stopped, VND per hour. */
  downtimeRate: number;
  /** Filters and other parts per oil change, VND. */
  partsPerChange: number;
  /** Time one oil change (relubrication) takes, hours. */
  hoursPerChange: number;
  /** Parts cost of one breakdown repair, VND. */
  repairCost: number;
  /** Time one breakdown repair takes, hours. */
  repairHours: number;
  /** Power drawn, kW (fuel use in litres per 100 km for a fleet). 0 skips energy. */
  energyUse: number;
  /** Electricity price, VND per kWh (fuel price, VND per litre, for a fleet). */
  energyPrice: number;
};

/** Inputs that differ between the current lubricant and the alternative. */
export type OptionInputs = {
  /** Product slug, or "" for a product not on the site. */
  product: string;
  /** Price, VND per litre (per kg for grease). */
  price: number;
  /** Hours between oil changes (km for a fleet). */
  interval: number;
  /** Oil added between changes, litres (kg) per year per machine. */
  topUp: number;
  /** Breakdowns per year per machine. */
  failures: number;
  /** Measured or documented reduction in energy use, %. */
  energySaving: number;
};

export type OptionResult = {
  changesPerYear: number;
  lubricant: number;
  service: number;
  serviceDowntime: number;
  repairs: number;
  energy: number;
  /** Per machine, per year. */
  total: number;
  downtimeHours: number;
};

export type Comparison = {
  current: OptionResult;
  proposed: OptionResult;
  /** All machines, per year. */
  currentFleet: number;
  proposedFleet: number;
  /** Positive when the alternative costs less. */
  savingFleet: number;
  savingPct: number;
};

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function computeOption(kind: EquipmentKind, s: SharedInputs, o: OptionInputs): OptionResult {
  const changesPerYear = n(o.interval) > 0 ? n(s.usage) / n(o.interval) : 0;
  const lubricant = (changesPerYear * n(s.fill) + n(o.topUp)) * n(o.price);
  const service = changesPerYear * (n(s.hoursPerChange) * n(s.laborRate) + n(s.partsPerChange));
  const serviceDowntime = changesPerYear * n(s.hoursPerChange) * n(s.downtimeRate);
  const repairs =
    n(o.failures) * (n(s.repairCost) + n(s.repairHours) * (n(s.laborRate) + n(s.downtimeRate)));
  const energyBase =
    kind === "fleet"
      ? (n(s.energyUse) * n(s.usage)) / 100 * n(s.energyPrice)
      : n(s.energyUse) * n(s.usage) * n(s.energyPrice);
  const energy = energyBase * (1 - Math.min(n(o.energySaving), 100) / 100);
  const total = lubricant + service + serviceDowntime + repairs + energy;
  const downtimeHours = changesPerYear * n(s.hoursPerChange) + n(o.failures) * n(s.repairHours);
  return { changesPerYear, lubricant, service, serviceDowntime, repairs, energy, total, downtimeHours };
}

export function compare(
  kind: EquipmentKind,
  shared: SharedInputs,
  current: OptionInputs,
  proposed: OptionInputs
): Comparison {
  const c = computeOption(kind, shared, current);
  const p = computeOption(kind, shared, proposed);
  const units = Math.max(1, Math.round(n(shared.units)));
  const currentFleet = c.total * units;
  const proposedFleet = p.total * units;
  const savingFleet = currentFleet - proposedFleet;
  return {
    current: c,
    proposed: p,
    currentFleet,
    proposedFleet,
    savingFleet,
    savingPct: currentFleet > 0 ? (savingFleet / currentFleet) * 100 : 0,
  };
}

/** Starting values: typical operating figures, identical for both options. */
export function defaultInputs(kind: EquipmentKind): {
  shared: SharedInputs;
  option: Omit<OptionInputs, "product">;
} {
  const base = { laborRate: 60_000, downtimeRate: 0, repairCost: 0, repairHours: 0, energyPrice: 2_200 };
  switch (kind) {
    case "compressor":
      return {
        shared: { ...base, units: 1, usage: 6_000, fill: 20, partsPerChange: 1_500_000, hoursPerChange: 3, energyUse: 0 },
        option: { price: 0, interval: 4_000, topUp: 0, failures: 0, energySaving: 0 },
      };
    case "gearbox":
      return {
        shared: { ...base, units: 1, usage: 6_000, fill: 50, partsPerChange: 0, hoursPerChange: 4, energyUse: 0 },
        option: { price: 0, interval: 5_000, topUp: 0, failures: 0, energySaving: 0 },
      };
    case "hydraulic":
      return {
        shared: { ...base, units: 1, usage: 6_000, fill: 200, partsPerChange: 2_000_000, hoursPerChange: 6, energyUse: 0 },
        option: { price: 0, interval: 5_000, topUp: 0, failures: 0, energySaving: 0 },
      };
    case "grease":
      return {
        shared: { ...base, units: 10, usage: 6_000, fill: 0.1, partsPerChange: 0, hoursPerChange: 0.5, energyUse: 0 },
        option: { price: 0, interval: 500, topUp: 0, failures: 0, energySaving: 0 },
      };
    case "fleet":
      return {
        shared: { ...base, units: 10, usage: 100_000, fill: 20, partsPerChange: 500_000, hoursPerChange: 2, energyUse: 0, energyPrice: 20_000 },
        option: { price: 0, interval: 10_000, topUp: 0, failures: 0, energySaving: 0 },
      };
  }
}
