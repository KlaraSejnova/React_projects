import dashboardConfig from "@/app/data/dashboard.json";

export interface DashboardUser {
  id: string;
  name: string;
  vocative: string;
}

export interface DashboardDay {
  key: string;
  label: string;
  fullLabel: string;
}

export interface DashboardRoutine {
  id: string;
  icon: string;
  name: string;
  detail: string;
  color: string;
}

export type CompletionState = Record<string, boolean>;

type DashboardConfig = {
  users: DashboardUser[];
  days: DashboardDay[];
  routines: DashboardRoutine[];
};

const config = dashboardConfig as DashboardConfig;

export const users = config.users;
export const days = config.days;
export const routines = config.routines;
