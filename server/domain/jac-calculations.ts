export function isValidNitFormat(nit: string) {
  return /^\d{1,3}(?:\.\d{3}){2,3}-\d$|^\d{9,10}-?\d?$/.test(nit.trim());
}

export function calculateFinancialBalance(income: number, expenses: number) {
  return Number((income - expenses).toFixed(2));
}

export function isObligationOverdue(dueAt: Date, status: string, now = new Date()) {
  return status !== "cumplida" && dueAt.getTime() < now.getTime();
}
