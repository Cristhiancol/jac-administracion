import type { JacRole } from "./jac-domain";

export function canAccessJacRole(technicalRole: "admin" | "user", jacRole: JacRole, allowedRoles: readonly JacRole[]) {
  return technicalRole === "admin" || allowedRoles.includes(jacRole);
}
