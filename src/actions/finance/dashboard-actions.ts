"use server";

import { FinanceQueryService } from "@/services/finance/finance-query-service";
import {
  FinanceActionResult,
  withFinanceActionErrorHandler,
} from "./finance-action-utils";
import { FinanceDashboardSummaryDTO } from "./finance-dtos";

export async function getFinanceDashboardSummaryAction(): Promise<
  FinanceActionResult<FinanceDashboardSummaryDTO>
> {
  return withFinanceActionErrorHandler(async (context) => {
    // No input validation needed for this action as it takes no arguments
    const result = await FinanceQueryService.getFinanceDashboardSummary(context);
    return {
      totalDrafts: result.totalDrafts,
      totalPendingReview: result.totalPendingReview,
      totalApproved: result.totalApproved,
      openPeriodsCount: result.openPeriodsCount,
    };
  });
}
