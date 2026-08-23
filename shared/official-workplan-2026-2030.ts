/**
 * Plan de Trabajo Oficial — Junta de Acción Comunal Bellavista (2026 – 2030)
 * Personería Jurídica N.º 0837 de 1991 · Código Comunal: 5084
 */

export interface WorkPlanAxis {
  id: number;
  eje: string;
  actividades: string;
  resultadoEsperado: string;
  comisionSugerida: string;
  estado: "planeada" | "en_ejecucion" | "completada";
  icono: string;
}

export const OFFICIAL_WORK_PLAN_2026_2030: WorkPlanAxis[] = [
  {
    id: 1,
    eje: "Organización y legalidad",
    actividades: "Actualizar libro de afiliados, inventario, actas, reglamentos y responsables.",
    resultadoEsperado: "Información ordenada, trazable y lista para Asamblea.",
    comisionSugerida: "Secretaría General y Directiva",
    estado: "en_ejecucion",
    icono: "Scale",
  },
  {
    id: 2,
    eje: "Salón comunal",
    actividades: "Diagnóstico técnico, inventario de sillas/equipos, presupuesto, ampliación y reglas de préstamo o reserva.",
    resultadoEsperado: "Salón más útil, seguro y sostenible.",
    comisionSugerida: "Obras y Salón Comunal",
    estado: "en_ejecucion",
    icono: "Home",
  },
  {
    id: 3,
    eje: "Seguridad",
    actividades: "Identificar puntos críticos, gestionar cámaras y articular acciones con la comunidad y autoridades.",
    resultadoEsperado: "Propuesta de seguridad con privacidad y mantenimiento definido.",
    comisionSugerida: "Seguridad y Convivencia",
    estado: "planeada",
    icono: "ShieldCheck",
  },
  {
    id: 4,
    eje: "Residuos",
    actividades: "Diseñar punto de aprovechamiento, separación en la fuente y alianza con recicladores.",
    resultadoEsperado: "Centro comunitario para reducir residuos y aprovechar materiales.",
    comisionSugerida: "Comité Ambiental",
    estado: "planeada",
    icono: "Recycle",
  },
  {
    id: 5,
    eje: "Tecnología",
    actividades: "Implementar aplicación web para afiliados, reservas, inventario, gastos, carnets QR y documentos.",
    resultadoEsperado: "Gestión digital, consulta transparente y control de bienes.",
    comisionSugerida: "Comisión de Tecnología y Comunicación",
    estado: "en_ejecucion",
    icono: "Laptop",
  },
  {
    id: 6,
    eje: "Tesorería y control",
    actividades: "Registrar ingresos, gastos, soportes, legalizaciones y reportes trimestrales.",
    resultadoEsperado: "Rendición de cuentas clara para Asamblea, Tesorería y Fiscalía.",
    comisionSugerida: "Tesorería y Fiscalía",
    estado: "en_ejecucion",
    icono: "Landmark",
  },
  {
    id: 7,
    eje: "Convivencia y participación",
    actividades: "Jornadas de prevención, conciliación, actividades deportivas, culturales y comités de trabajo.",
    resultadoEsperado: "Mayor participación, prevención de conflictos y trabajo comunitario.",
    comisionSugerida: "Cultura, Deportes y Convivencia",
    estado: "en_ejecucion",
    icono: "Users",
  },
  {
    id: 8,
    eje: "Gestión institucional",
    actividades: "Presentar proyectos y solicitudes ante IDPAC, Alcaldía Local de Usme, UAESP, Secretaría de Seguridad e IDRD.",
    resultadoEsperado: "Apoyo técnico y búsqueda de recursos institucionales para Usme.",
    comisionSugerida: "Directiva y Relaciones Institucionales",
    estado: "planeada",
    icono: "Building2",
  },
];
