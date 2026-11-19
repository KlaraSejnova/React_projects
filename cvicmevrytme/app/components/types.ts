export type Page = "overview" | "runs" | "compare";
export type Period = "30" | "90" | "all";
export type ChartMetric = Exclude<import("@/lib/chart").ChartMetric, "heartRate">;
