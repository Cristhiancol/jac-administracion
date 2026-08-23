# 🏘️ Junta de Acción Comunal Bellavista (1991)

> **Personería Jurídica N.º 0837 de 1991** · **Código Comunal: 5084**
> Localidad de Usme · Bogotá D.C., Colombia

**"Todos Somos Comunidad"**

---

## 📋 Descripción

Plataforma integral de **gestión comunitaria, gobernanza transparente y participación ciudadana** para la Junta de Acción Comunal Bellavista. El sistema permite administrar afiliados, asambleas con asistencia QR, presupuesto participativo, campeonatos deportivos, campañas sociales y reservas del salón comunal.

## 🏗️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, TypeScript, TailwindCSS v4, Wouter, Framer Motion |
| **Backend** | Express.js, tRPC v10, SuperJSON |
| **ORM / Base de Datos** | Drizzle ORM, MySQL |
| **Autenticación** | OAuth (Manus), Cookies con roles JAC |
| **Testing** | Vitest, React Testing Library |
| **Diseño** | Sistema de identidad visual institucional con Usme Color System |

## 🎨 Identidad Visual

El sistema implementa la identidad visual oficial de la JAC:

- **Azul Institucional**: `#0F4C81` – Gestión pública y gobierno comunal
- **Verde Usme / Páramo**: `#1B8A5A`, `#166534` – Naturaleza rural, huertas urbanas
- **Dorado Comunitario**: `#EAB308`, `#F59E0B` – Solidaridad y unión vecinal
- **Logo**: Emblema SVG vectorizado con apretón de manos dorado, anillo azul con texto "TODOS SOMOS COMUNIDAD - BELLAVISTA" y cinta con "1991"

## 📦 Módulos del Sistema

### 1. 🏛️ Identidad Institucional
- Ficha comunal con NIT, personería jurídica y verificación IDPAC
- Carnet digital con código QR para afiliados
- Logo SVG vectorizado con variantes: full, icon, watermark, monochrome

### 2. 👥 Libro Digital de Afiliados
- Registro manual y carga masiva desde archivo Excel/CSV
- Campos: Código, Nombre Completo, Cédula, Dirección, Teléfono, Comité
- Generación automática de QR por afiliado
- Estados: Activo ✅ | Inactivo ⚪ | Suspendido 🔴

### 3. 📋 Asambleas con Control QR
- Creación de asambleas (Ordinaria, Extraordinaria, Comité)
- Generación automática de código QR por asamblea
- Check-in por escaneo QR o digitación de cédula
- Panel en vivo: Verde = Asistió, Rojo = No Asistió
- Historial de asistencia y porcentajes de quórum

### 4. ⚽ Campeonatos Deportivos
- Registro de torneos: Campeonato, Copa, Torneo Relámpago
- Control de equipos, reglamento y fechas
- Estados: Inscripción → En Curso → Finalizado

### 5. 🌱 Campañas Comunitarias
- Tipos: Ambiental, Salud, Cultural, Educativa, Deportiva
- Seguimiento por estado y fechas
- Vinculación con el plan de trabajo comunal

### 6. 💰 Tesorería y Finanzas
- Registro de ingresos y egresos con categorización
- Presupuestos por periodo y fuente
- Auditoría y transparencia financiera

### 7. 📅 Reservas del Salón Comunal
- Solicitud con validación de disponibilidad
- Tipos: Afiliado JAC, Vecino, Externo
- Flujo de aprobación por la directiva
- Calendario de eventos

### 8. 📰 Noticias Institucionales
- Sincronización con fuentes oficiales (Alcaldía Local de Usme)
- Panel de noticias verificadas

### 9. 📊 Plan de Trabajo y Obligaciones
- Comisiones de trabajo con responsables
- Actividades con metas, avance y evidencias
- Matriz de obligaciones legales con alertas de vencimiento

## 🚀 Instalación y Despliegue Local

### Requisitos
- Node.js ≥ 18
- pnpm (recomendado) o npm
- MySQL 8+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Cristhiancol/jac-administracion.git
cd jac-administracion

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de base de datos MySQL

# 4. Migrar base de datos
pnpm drizzle-kit push

# 5. Iniciar en modo desarrollo
pnpm dev
```

### Variables de Entorno (.env)

```env
DATABASE_URL=mysql://user:password@localhost:3306/jac_bellavista
SESSION_SECRET=tu_secret_seguro_aqui
OWNER_OPEN_ID=tu_open_id_admin
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
pnpm test

# Ejecutar tests con cobertura
pnpm test:coverage

# Build de producción
pnpm build
```

## 📂 Estructura del Proyecto

```
jac-administracion/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── JacLogo.tsx    # Logo SVG vectorizado oficial
│   │   │   ├── jac/           # Componentes JAC (Shell, StatusBadge)
│   │   │   └── ui/            # Componentes shadcn/ui
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   ├── Home.tsx       # Panel principal
│   │   │   ├── Affiliates.tsx # Libro de afiliados
│   │   │   ├── Assemblies.tsx # Asambleas y QR
│   │   │   ├── Championships.tsx # Campeonatos y campañas
│   │   │   ├── Reservations.tsx  # Reservas salón
│   │   │   ├── Finance.tsx    # Tesorería
│   │   │   └── ...
│   │   ├── lib/               # Utilidades (trpc, calculations)
│   │   └── contexts/          # Providers (Theme, Auth)
│   └── public/
│       └── favicon.svg        # Favicon institucional
├── server/                    # Backend Express + tRPC
│   ├── routers/               # Routers tRPC
│   │   ├── affiliates.ts      # CRUD afiliados + Excel import
│   │   ├── assemblies.ts      # Asambleas + QR check-in
│   │   ├── championships.ts   # Campeonatos + campañas
│   │   ├── reservations.ts    # Reservas salón
│   │   ├── finance.ts         # Movimientos financieros
│   │   └── ...
│   └── db.ts                  # Funciones de base de datos
├── drizzle/
│   └── schema.ts              # Esquema completo de base de datos
├── shared/                    # Tipos y esquemas compartidos
│   ├── jac-domain.ts          # Constantes de dominio
│   ├── jac-forms.ts           # Schemas Zod de validación
│   └── jac-access.ts          # Control de acceso por rol
└── package.json
```

## 👤 Roles del Sistema

| Rol JAC | Permisos |
|---------|----------|
| **Directiva** | Acceso total: CRUD afiliados, asambleas, campeonatos, finanzas |
| **Coordinador de Comité** | Gestión del comité asignado, reportes de actividades |
| **Tesorero/Fiscal** | Registro financiero, presupuestos, auditoría |
| **Secretario** | Actas, convocatorias, correspondencia |
| **Afiliado** | Consulta, reservas, asistencia a asambleas |

## 🔧 Comandos Git para Actualización

```bash
# Agregar todos los cambios
git add .

# Commit semántico
git commit -m "feat(phase-2): add affiliates, assemblies QR, championships, reservations modules

- Add affiliates management with Excel/CSV bulk import
- Add assemblies with QR attendance check-in system
- Add championships and community campaigns
- Add facility reservations with availability calendar
- Update JacLogo.tsx to match official 1991 emblem
- Update navigation with new module links
- Extend database schema with 5 new tables
- Add backend tRPC routers for all new modules
- Update README.md with complete documentation"

# Subir a GitHub
git push origin main
```

## 📄 Licencia

Propiedad de la **Junta de Acción Comunal Bellavista (1991)** – Personería Jurídica N.º 0837.
Todos los derechos reservados. Uso exclusivo para la gestión comunal del barrio Bellavista, localidad de Usme, Bogotá D.C.

---

> Desarrollado con ❤️ para la comunidad de Bellavista, Usme.
> *"Todos Somos Comunidad"* 🤝
