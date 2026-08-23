# 🏛️ Junta de Acción Comunal Bellavista (1991) - Plataforma Web de Gestión Comunal

![JAC Bellavista 1991 Banner](client/public/favicon.svg)

> **"Todos Somos Comunidad"** · Localidad de Usme, Bogotá D.C.  
> Personería Jurídica N.º 0837 del 15 de marzo de 1991 · Código Comunal IDPAC 5084

---

## 📌 Descripción del Proyecto

Plataforma web integral para la administración, trazabilidad financiera, registro de afiliados, gestión del plan de trabajo por comisiones y gobernabilidad transparente de la **Junta de Acción Comunal Barrio Bellavista (1991)** en Usme.

La aplicación integra la identidad visual oficial del barrio y el páramo de Usme, combinando seriedad institucional, sostenibilidad agrícola urbana y calor comunitario.

---

## 🎨 Identidad Visual & Sistema de Diseño

### 1. Logo Vectorial SVG (`JacLogo.tsx` & `favicon.svg`)
- **Apretón de Manos (Isotipo)**: Tonos dorados cálidos (`#FACC15`, `#F59E0B`), simbolizando unión comunitaria, fraternidad y trabajo en equipo.
- **Marco Institucional**: Anillo exterior con engranaje en Azul Institucional Bogotá (`#0F4C81`) y Verde Huerta/Páramo de Usme (`#1B8A5A`).
- **Lema e Historia**: Inscripción de la Personería Jurídica de 1991 y cinta inferior con el lema *"TODOS SOMOS COMUNIDAD"*.
- **Carnet Digital QR**: Marca de agua vectorial integrada en certificados y carnet digital de afiliado.

### 2. Paleta Cromática Institucional & Territorial
| Elemento / Concepto | Código HEX | Significado |
| :--- | :--- | :--- |
| **Verde Usme Rural / Huertas** | `#166534` / `#1B8A5A` / `#22C55E` | Agricultura urbana, huertas comunitarias, páramo de Sumapaz y sostenibilidad. |
| **Azul Institucional Bogotá** | `#0F4C81` / `#1E3A8A` | Gestión pública, seriedad, trazabilidad legal e institucionalidad. |
| **Acentuación Comunal** | `#EAB308` / `#F59E0B` | Calor humano, participación en asambleas, deportes y logros comunales. |
| **Superficie Accesible (AAA)** | `#F8FAFC` (Claro) / `#0F172A` (Oscuro) | Cumplimiento estricto del nivel AAA de accesibilidad (WCAG 2.1). |

---

## 🚀 Módulos Funcionales

1. **Panel Principal (Dashboard)**: Métricas en tiempo real de avance de metas, saldo de tesorería, matriz legal y eventos comunales.
2. **Ficha e Identidad Institucional**: Gestión de la Personería Jurídica de 1991, NIT, dirección oficial de la sede con mapa interactivo y **Carnet Comunal Digital con QR**.
3. **Plan Comunal & Comisiones**: Seguimiento de proyectos por comisiones (deportes, huerta, seguridad, cultura).
4. **Obligaciones & Matriz Legal**: Control de estatutos, actas de asamblea, verificación de quórum y libros comunales.
5. **Finanzas & Tesorería**: Registro auditado de ingresos, aportes comunitarios, egresos y comprobantes de caja.
6. **Noticias Usme**: Sincronización oficial de comunicados con la Alcaldía Local de Usme.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, TailwindCSS v4, Framer Motion, Lucide React, Wouter.
- **Backend & API**: Node.js, Express, tRPC, Drizzle ORM, SQLite / PostgreSQL.
- **Pruebas Unitarias**: Vitest (100% test coverage en dominio comunal).
- **Herramientas de Construcción**: Vite 7, Esbuild.

---

## 🧪 Validación Técnica y Pruebas

### Pruebas Unitarias e Integración (`vitest`)
```bash
# Ejecutar la suite completa de pruebas
npx vitest run
```
> **Resultado**: 10/10 archivos de prueba aprobados (`23/23 tests passed`).

### Compilación de Producción (`build`)
```bash
# Generar los bundles optimizados para despliegue
npm run build
```
> **Resultado**: Generación limpia en `dist/` de artefactos cliente y servidor Node.js.

---

## 📦 Instrucciones para Git y Despliegue

```bash
# 1. Agregar cambios y actualizar el README.md
git add .

# 2. Hacer commit semántico
git commit -m "docs: agregar README.md completo e identidad JAC Bellavista 1991"

# 3. Subir los cambios a tu repositorio remoto en GitHub
git push -u origin main
```
