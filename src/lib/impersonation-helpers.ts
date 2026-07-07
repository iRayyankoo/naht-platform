export const IMPERSONATION_ENABLED = false;

export function isImpersonationEnabled(): boolean {
  return IMPERSONATION_ENABLED;
}

// Placeholder types for future impersonation state
export interface ImpersonationState {
  isActive: boolean;
  type: "ROLE" | "USER" | null;
  targetId: string | null;
  targetName: string | null;
}

// These functions will be implemented later to read/write secure cookies
export async function getImpersonationState(): Promise<ImpersonationState> {
  return {
    isActive: false,
    type: null,
    targetId: null,
    targetName: null
  };
}
