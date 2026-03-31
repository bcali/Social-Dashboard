export interface KpiTarget {
  key: string;
  name: string;
  unit: string;
  direction: "above" | "below";
  baseline?: number | null;
  floor?: number | null;
  target: number | null;
}

export type KpiMetrics = Record<string, number | null>;

export interface KpiSnapshot {
  period: string;
  date: string;
  metrics: KpiMetrics;
}

export interface KpiData {
  targets: KpiTarget[];
  history: KpiSnapshot[];
}
