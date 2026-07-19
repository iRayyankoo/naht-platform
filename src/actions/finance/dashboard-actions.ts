"use server";

import { handleGetFinanceDashboardSummary } from "./finance-handlers";

export async function getFinanceDashboardSummaryAction() {
  return handleGetFinanceDashboardSummary();
}
