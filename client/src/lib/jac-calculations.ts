export function calculateProgress(completedActivities: number, totalActivities: number) {
  if (totalActivities <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((completedActivities / totalActivities) * 100)));
}

export function calculateBalance(income: number, expenses: number) {
  return Number((income - expenses).toFixed(2));
}

export function getBudgetExecution(spent: number, budget: number) {
  if (budget <= 0) return 0;
  return Math.max(0, Math.round((spent / budget) * 100));
}
