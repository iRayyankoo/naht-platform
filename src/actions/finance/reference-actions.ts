"use server";

import { handleListLedgers, handleListCurrencies, handleListAccounts, handleListCostCenters, handleListOpenPeriods } from "./finance-handlers";
import { 
  ListLedgersInputSchema, 
  ListCurrenciesInputSchema, 
  ListAccountsInputSchema, 
  ListCostCentersInputSchema, 
  ListOpenPeriodsInputSchema 
} from "./finance-dtos";
import { z } from "zod";

export async function listLedgersAction(input: z.infer<typeof ListLedgersInputSchema>) {
  return handleListLedgers(input);
}

export async function listCurrenciesAction(input: z.infer<typeof ListCurrenciesInputSchema>) {
  return handleListCurrencies(input);
}

export async function listAccountsAction(input: z.infer<typeof ListAccountsInputSchema>) {
  return handleListAccounts(input);
}

export async function listCostCentersAction(input: z.infer<typeof ListCostCentersInputSchema>) {
  return handleListCostCenters(input);
}

export async function listOpenPeriodsAction(input: z.infer<typeof ListOpenPeriodsInputSchema>) {
  return handleListOpenPeriods(input);
}
