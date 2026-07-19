"use server";

import { PeriodService } from "@/services/finance/period-service";
import { FinanceQueryService } from "@/services/finance/finance-query-service";
import {
  FinanceActionResult,
  withFinanceActionErrorHandler,
} from "./finance-action-utils";
import {
  IdInputSchema,
  ListPeriodsInputSchema,
  FinanceFiscalPeriodDTO,
  mapPeriodToDTO,
} from "./finance-dtos";

export async function freezePeriodAction(
  input: unknown
): Promise<FinanceActionResult<FinanceFiscalPeriodDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await PeriodService.freezePeriod(context, data.id);
    return mapPeriodToDTO(result as any);
  });
}

export async function unfreezePeriodAction(
  input: unknown
): Promise<FinanceActionResult<FinanceFiscalPeriodDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await PeriodService.unfreezePeriod(context, data.id);
    return mapPeriodToDTO(result as any);
  });
}

export async function closePeriodAction(
  input: unknown
): Promise<FinanceActionResult<FinanceFiscalPeriodDTO>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = IdInputSchema.parse(input);
    const result = await PeriodService.closePeriod(context, data.id);
    return mapPeriodToDTO(result as any);
  });
}

export async function listPeriodsAction(
  input: unknown
): Promise<FinanceActionResult<{ items: FinanceFiscalPeriodDTO[]; total: number }>> {
  return withFinanceActionErrorHandler(async (context) => {
    const data = ListPeriodsInputSchema.parse(input);
    const result = await FinanceQueryService.listPeriods(
      context,
      { fiscalYearId: data.fiscalYearId },
      { skip: data.skip, take: data.take }
    );
    return {
      items: result.items.map((p) => mapPeriodToDTO(p as any)),
      total: result.total,
    };
  });
}
