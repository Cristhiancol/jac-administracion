# Configuración segura del entorno

La configuración sensible de esta aplicación se administra mediante el panel seguro del entorno de despliegue. Por esta razón, el repositorio no contiene archivos `.env` o `.env.example` editables. Esta decisión evita que se incluyan tokens, claves de sesión o datos operativos en el código fuente.

| Variable administrada | Uso dentro de la aplicación | Gestión |
| --- | --- | --- |
| `DATABASE_URL` | Conexión de Drizzle a la base de datos. | Entorno administrado |
| `JWT_SECRET` | Firma de sesiones. | Entorno administrado |
| `VITE_APP_TITLE` | Nombre visible de la aplicación. | Entorno administrado |
| `VITE_FRONTEND_FORGE_API_KEY` | Servicios de mapa proporcionados por el entorno. | Entorno administrado |
| `VITE_FRONTEND_FORGE_API_URL` | URL de los servicios proporcionados por el entorno. | Entorno administrado |

La URL pública de la Alcaldía Local de Usme se conserva inicialmente como una constante de dominio documentada y como URL de origen en cada noticia sincronizada. Si en el futuro se requiere parametrizarla, se registrará mediante la gestión segura de configuración y nunca en un archivo de secretos versionado.
