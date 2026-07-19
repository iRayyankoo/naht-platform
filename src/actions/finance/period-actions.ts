"use server";

import {
  handleFreezePeriod,
  handleUnfreezePeriod,
  handleClosePeriod,
  handleListPeriods,
} from "./finance-handlers";

export async function freezePeriodAction(input: unknown) {
  return handleFreezePeriod(input);
}

export async function unfreezePeriodAction(input: unknown) {
  return handleUnfreezePeriod(input);
}

export async function closePeriodAction(input: unknown) {
  return handleClosePeriod(input);
}

export async function listPeriodsAction(input: unknown) {
  return handleListPeriods(input);
}
