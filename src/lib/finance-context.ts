export interface FinanceActionContext {
  actorId: string;
  impersonatorId?: string | null;
  correlationId: string;
}