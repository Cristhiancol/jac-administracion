/**
 * Reporte oficial de gastos consolidados a la fecha (2025 - 2026)
 * Junta de Acción Comunal Bellavista (1991)
 */

export interface ExpenseByCategory {
  category: string;
  year2025: number;
  year2026: number;
  total: number;
  percentage: number;
}

export interface ExpenseByMonth {
  month: string;
  year2025: number;
  year2026: number;
  total: number;
}

export const REPORTED_EXPENSES_BY_CATEGORY: ExpenseByCategory[] = [
  { category: "Agua", year2025: 101722, year2026: 209670, total: 311392, percentage: 3.2 },
  { category: "Luz", year2025: 598550, year2026: 1013630, total: 1612180, percentage: 16.6 },
  { category: "Gas", year2025: 27260, year2026: 58680, total: 85940, percentage: 0.9 },
  { category: "Seguros", year2025: 0, year2026: 222816, total: 222816, percentage: 2.3 },
  { category: "Aseo", year2025: 60900, year2026: 102050, total: 162950, percentage: 1.7 },
  { category: "Documentación y trámites", year2025: 0, year2026: 1214000, total: 1214000, percentage: 12.5 },
  { category: "Comunicación y tecnología", year2025: 0, year2026: 45000, total: 45000, percentage: 0.5 },
  { category: "Capacitación", year2025: 0, year2026: 210000, total: 210000, percentage: 2.2 },
  { category: "Alimentación y eventos", year2025: 1643250, year2026: 1809700, total: 3452950, percentage: 35.5 },
  { category: "Materiales y mantenimiento", year2025: 517950, year2026: 973000, total: 1490950, percentage: 15.3 },
  { category: "Otros", year2025: 0, year2026: 931500, total: 931500, percentage: 9.6 },
];

export const REPORTED_EXPENSES_BY_MONTH: ExpenseByMonth[] = [
  { month: "Enero", year2025: 0, year2026: 184520, total: 184520 },
  { month: "Febrero", year2025: 0, year2026: 351236, total: 351236 },
  { month: "Marzo", year2025: 0, year2026: 295930, total: 295930 },
  { month: "Abril", year2025: 0, year2026: 354730, total: 354730 },
  { month: "Mayo", year2025: 0, year2026: 145380, total: 145380 },
  { month: "Junio", year2025: 17850, year2026: 165450, total: 183300 },
  { month: "Julio", year2025: 120640, year2026: 113450, total: 234090 },
  { month: "Agosto", year2025: 124290, year2026: 275430, total: 399720 },
  { month: "Septiembre", year2025: 970580, year2026: 0, total: 970580 },
  { month: "Octubre", year2025: 969060, year2026: 0, total: 969060 },
  { month: "Noviembre", year2025: 270870, year2026: 0, total: 270870 },
  { month: "Diciembre", year2025: 364620, year2026: 0, total: 364620 },
  { month: "Sin mes reportado", year2025: 111722, year2026: 4903920, total: 5015642 },
];

export const TOTAL_EXPENSES_2025 = 2949632;
export const TOTAL_EXPENSES_2026 = 6790046;
export const TOTAL_EXPENSES_ALL = 9739678;

/**
 * Genera movimientos individuales a partir de la distribución reportada para el libro de caja
 */
export const SEEDED_FINANCIAL_MOVEMENTS = [
  // 2025
  { id: 1, movementType: "egreso" as const, category: "Alimentación y eventos", source: "Tesoría JAC", description: "Alimentación y eventos comunales 2025", amount: "1643250", occurredAt: new Date("2025-10-15"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2025-10-15"), updatedAt: new Date("2025-10-15") },
  { id: 2, movementType: "egreso" as const, category: "Luz", source: "Servicios Públicos", description: "Pago servicio de energía 2025", amount: "598550", occurredAt: new Date("2025-09-20"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2025-09-20"), updatedAt: new Date("2025-09-20") },
  { id: 3, movementType: "egreso" as const, category: "Materiales y mantenimiento", source: "Mantenimiento Salón", description: "Materiales y reparaciones salón comunal 2025", amount: "517950", occurredAt: new Date("2025-11-10"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2025-11-10"), updatedAt: new Date("2025-11-10") },
  { id: 4, movementType: "egreso" as const, category: "Agua", source: "Servicios Públicos", description: "Pago acueducto y alcantarillado 2025", amount: "101722", occurredAt: new Date("2025-08-05"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2025-08-05"), updatedAt: new Date("2025-08-05") },
  { id: 5, movementType: "egreso" as const, category: "Aseo", source: "Servicios Públicos", description: "Servicio de aseo 2025", amount: "60900", occurredAt: new Date("2025-07-12"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2025-07-12"), updatedAt: new Date("2025-07-12") },
  { id: 6, movementType: "egreso" as const, category: "Gas", source: "Servicios Públicos", description: "Servicio de gas 2025", amount: "27260", occurredAt: new Date("2025-06-18"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2025-06-18"), updatedAt: new Date("2025-06-18") },

  // 2026
  { id: 7, movementType: "egreso" as const, category: "Alimentación y eventos", source: "Eventos Comunitarios", description: "Alimentación y logística asambleas y eventos 2026", amount: "1809700", occurredAt: new Date("2026-04-10"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-04-10"), updatedAt: new Date("2026-04-10") },
  { id: 8, movementType: "egreso" as const, category: "Documentación y trámites", source: "Gestión Legal IDPAC", description: "Trámites legales, notariales y personería jurídica 2026", amount: "1214000", occurredAt: new Date("2026-02-15"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-02-15"), updatedAt: new Date("2026-02-15") },
  { id: 9, movementType: "egreso" as const, category: "Luz", source: "Servicios Públicos", description: "Pago servicio de energía 2026", amount: "1013630", occurredAt: new Date("2026-03-22"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-03-22"), updatedAt: new Date("2026-03-22") },
  { id: 10, movementType: "egreso" as const, category: "Materiales y mantenimiento", source: "Mantenimiento Salón", description: "Reparaciones e insumos salón comunal 2026", amount: "973000", occurredAt: new Date("2026-05-18"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-05-18"), updatedAt: new Date("2026-05-18") },
  { id: 11, movementType: "egreso" as const, category: "Otros", source: "Caja Menor", description: "Imprevistos y gastos diversos reportados 2026", amount: "931500", occurredAt: new Date("2026-06-05"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-06-05"), updatedAt: new Date("2026-06-05") },
  { id: 12, movementType: "egreso" as const, category: "Seguros", source: "Póliza Comunal", description: "Seguro de responsabilidad y bienes 2026", amount: "222816", occurredAt: new Date("2026-01-30"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-01-30"), updatedAt: new Date("2026-01-30") },
  { id: 13, movementType: "egreso" as const, category: "Capacitación", source: "Formación Comunal", description: "Capacitación a líderes y dignatarios 2026", amount: "210000", occurredAt: new Date("2026-07-08"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-07-08"), updatedAt: new Date("2026-07-08") },
  { id: 14, movementType: "egreso" as const, category: "Agua", source: "Servicios Públicos", description: "Pago acueducto y alcantarillado 2026", amount: "209670", occurredAt: new Date("2026-08-01"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-08-01"), updatedAt: new Date("2026-08-01") },
  { id: 15, movementType: "egreso" as const, category: "Aseo", source: "Servicios Públicos", description: "Servicio de aseo 2026", amount: "102050", occurredAt: new Date("2026-08-10"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-08-10"), updatedAt: new Date("2026-08-10") },
  { id: 16, movementType: "egreso" as const, category: "Gas", source: "Servicios Públicos", description: "Servicio de gas 2026", amount: "58680", occurredAt: new Date("2026-07-25"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-07-25"), updatedAt: new Date("2026-07-25") },
  { id: 17, movementType: "egreso" as const, category: "Comunicación y tecnología", source: "Conectividad", description: "Servicio de internet y recargas tecnológicas 2026", amount: "45000", occurredAt: new Date("2026-08-15"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-08-15"), updatedAt: new Date("2026-08-15") },

  // Ingresos registrados para balance
  { id: 18, movementType: "ingreso" as const, category: "Aportes comunitarios", source: "Afiliados JAC", description: "Recaudo de cuotas y aportes afiliados 2025-2026", amount: "12500000", occurredAt: new Date("2026-01-10"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-10") },
  { id: 19, movementType: "ingreso" as const, category: "Alquiler Salón", source: "Eventos Comunitarios", description: "Ingresos por alquiler de salón comunal", amount: "3200000", occurredAt: new Date("2026-03-15"), activityId: null, supportUrl: null, recordedByUserId: 1, createdAt: new Date("2026-03-15"), updatedAt: new Date("2026-03-15") },
];
