# CityPass+ — Login Federado Frontend

Frontend del módulo de identidad y administración de accesos de **CityPass+**, la Plataforma de Servicios Urbanos Inteligentes.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![UADE](https://img.shields.io/badge/UADE-Desarrollo_de_Aplicaciones_II-004d99.svg)](https://www.uade.edu.ar/)

## Descripción

Este proyecto implementa la interfaz web del módulo de Login Federado. Consume una API integrada con OpenLDAP, administra sesiones mediante JWT y proporciona un panel protegido para gestionar usuarios, grupos y membresías.

Forma parte de la materia **Desarrollo de Aplicaciones II — segundo cuatrimestre de 2026**, dictada por el profesor Andrés Sacco en la Universidad Argentina de la Empresa.

[Prototipo de interfaz en Figma](https://www.figma.com/design/m2LnV4pIoZDh4wD1dfWCyU/Login---Dapis-2?node-id=3-2&t=HCMyf8hR4Mjeap7I-1)

## Funcionalidades

### Autenticación y cuenta

- Inicio y cierre de sesión.
- Access token y refresh token mantenidos únicamente en memoria.
- Inyección automática del access token en solicitudes protegidas.
- Renovación preventiva del token y reintento único ante respuestas `401`.
- Recuperación de contraseña mediante enlace.
- Restablecimiento y cambio de contraseña.
- Limpieza de sesión y caché al cerrar sesión o cambiar la contraseña.
- Rutas protegidas según el alcance y los grupos informados por el JWT.

### Administración de usuarios

- Listado paginado con búsqueda y filtros por estado, grupo y módulo.
- Alta y modificación de usuarios.
- Deshabilitación y rehabilitación de identidades.
- Visualización de los grupos asociados a cada usuario.
- Vistas diferenciadas para administradores generales y administradores de módulo.

### Administración de grupos

- Listado paginado con búsqueda y filtros por tipo y módulo.
- Creación de grupos.
- Consulta de miembros y remoción individual de membresías.
- Asignación masiva de múltiples usuarios a múltiples grupos.
- Resumen de asignaciones exitosas, omitidas, fallidas y advertencias.

### Experiencia de usuario

- Interfaz responsiva construida con Tailwind CSS y shadcn/ui.
- Formularios tipados con React Hook Form y Zod.
- Estados de carga, vacío y error.
- Notificaciones globales y límites de error para el panel.
- Componentes basados en primitivas accesibles de Radix UI.

## Stack tecnológico

| Área | Tecnologías |
|---|---|
| Interfaz | React 18, TypeScript 5, React Router 7 |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3, shadcn/ui, Radix UI |
| Formularios | React Hook Form, Zod |
| Datos remotos | Axios, TanStack Query |
| Estado cliente | Zustand |
| Pruebas | Vitest, React Testing Library, jsdom, cobertura V8 |
| Calidad | ESLint, SonarCloud |
| Seguridad del pipeline | Gitleaks, Trivy |
| Infraestructura | Docker, Nginx, GitHub Actions, GHCR, Vercel |

## Requisitos

- **Node.js 22** y npm para desarrollo local.
- Una instancia accesible del backend de Login Federado.
- Docker Desktop o Docker Engine con Compose, solamente si se utilizará el contenedor.

## Configuración local

### 1. Instalar dependencias

Desde la raíz del repositorio:

```bash
npm install
```

### 2. Configurar las variables de entorno

Crear un archivo `.env` en la raíz:

```dotenv
VITE_API_BASE_URL=/api
VITE_CLIENT_ID=<client-id-configurado-en-el-backend>
```

| Variable | Requerida | Descripción |
|---|---:|---|
| `VITE_API_BASE_URL` | Sí | URL base de la API. Con `/api`, Vite utiliza el proxy local hacia `http://127.0.0.1:8081`. |
| `VITE_CLIENT_ID` | Sí | Identificador de cliente enviado durante el login. Debe coincidir con el valor aceptado por el backend. |

Las variables prefijadas con `VITE_` quedan incluidas en el JavaScript entregado al navegador. No deben contener contraseñas, tokens ni otros secretos.

### 3. Iniciar el frontend

```bash
npm run dev
```

La aplicación queda disponible en [http://localhost:5173](http://localhost:5173).

El proxy de desarrollo espera el backend en `http://127.0.0.1:8081`. Para usar otra dirección, se debe actualizar `server.proxy` en `vite.config.ts` o configurar `VITE_API_BASE_URL` con una URL absoluta permitida por CORS.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR. |
| `npm run build` | Ejecuta TypeScript y genera el bundle de producción en `dist/`. |
| `npm run preview` | Sirve localmente el bundle generado. |
| `npm run lint` | Analiza el proyecto con ESLint. |
| `npm run typecheck` | Verifica tipos sin generar una salida nueva. |
| `npm test` | Ejecuta toda la suite una vez. |
| `npm run test:watch` | Ejecuta Vitest en modo interactivo. |
| `npm run test:coverage` | Ejecuta las pruebas y genera reportes de cobertura. |

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión. |
| `/forgot-password` | Público | Solicitud de recuperación de contraseña. |
| `/reset-password` | Público o autenticado | Restablecimiento mediante token o cambio desde el menú del usuario. |
| `/unauthorized` | Público | Informa que la sesión no posee permisos para el panel. |
| `/panel` | Protegido | Vista consolidada de usuarios, grupos y asignaciones. |
| `/panel/users` | Protegido | Administración de usuarios. |
| `/panel/groups` | Protegido | Administración de grupos y membresías. |

Una ruta protegida permite el acceso a:

- administradores con alcance general; o
- usuarios de módulo que tengan un módulo asignado y pertenezcan al grupo `delegados`.

El control del frontend organiza la navegación, pero la autorización definitiva de cada operación corresponde siempre al backend.

## Arquitectura

El proyecto utiliza una organización **Feature-Driven**: cada dominio mantiene juntos sus componentes, hooks, llamadas HTTP, tipos, esquemas y utilidades.

```text
src/
├── assets/                       # Recursos gráficos
├── components/
│   ├── ui/                       # Componentes visuales compartidos
│   └── AppErrorBoundary.tsx
├── features/
│   ├── auth/
│   │   ├── api/                  # Login, logout y contraseñas
│   │   ├── components/           # Pantallas y protección de rutas
│   │   ├── hooks/                # Mutaciones de autenticación
│   │   ├── session/              # Custodia de tokens en memoria
│   │   ├── store/                # Sesión compartida con Zustand
│   │   ├── types/
│   │   └── utils/                # JWT, validaciones y errores
│   └── systemManagement/
│       ├── api/                  # Endpoints del panel
│       ├── components/           # Páginas, tablas, filtros y diálogos
│       ├── hooks/                # Queries y mutaciones
│       ├── schemas/              # Validaciones Zod
│       ├── types/
│       └── utils/                # Caché, filtros, módulos y paginación
├── lib/
│   ├── axios.ts                  # Cliente HTTP, refresh e interceptores
│   ├── queryClient.ts            # Configuración de TanStack Query
│   └── utils.ts
├── tests/setup.ts
├── App.tsx                       # Providers y rutas
├── index.css
└── main.tsx
```

### Flujo de autenticación

```text
LoginForm
  → useLogin
  → POST /auth/login
  → establishSession
  → tokenVault + useAuthStore
  → ProtectedRoute
  → panel
```

Los tokens viven solamente en memoria. Por diseño, recargar o cerrar la pestaña elimina la sesión y requiere autenticarse nuevamente.

### Flujo de datos del panel

```text
Componente
  → hook de TanStack Query
  → función de API
  → instancia de Axios
  → backend
  → caché e interfaz
```

Las mutaciones invalidan las consultas relacionadas mediante claves centralizadas. Los cambios de membresías reconcilian tanto usuarios como grupos para evitar información desactualizada.

La explicación detallada de responsabilidades, flujos y ubicación de archivos está en la [guía de arquitectura](docs/guides/frontend-architecture.md).

## Pruebas y calidad

Los archivos de prueba se encuentran junto al código que verifican y utilizan los sufijos `.test.ts` o `.test.tsx`.

La configuración exige un mínimo de **60 %** para statements, branches, functions y lines. Para ejecutar la validación completa:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Los reportes HTML de cobertura se generan en `coverage/`.

## Docker

La imagen utiliza un build multi-stage:

1. Node.js 22 compila la aplicación.
2. Nginx 1.27 sirve los archivos estáticos como usuario sin privilegios en el puerto `8080`.

Para construir e iniciar el frontend:

```bash
docker compose up -d --build
```

La aplicación queda disponible en [http://localhost:5173](http://localhost:5173). Por defecto, el contenedor espera encontrar el backend en `http://host.docker.internal:8081`.

Comandos útiles:

```bash
docker compose ps
docker compose logs -f frontend
docker compose down
```

`VITE_API_BASE_URL` y `VITE_CLIENT_ID` son variables de compilación. Después de modificarlas se debe reconstruir la imagen; definirlas únicamente en un contenedor ya creado no cambia el bundle existente.

## Despliegue

### Contenedor y GHCR

GitHub Actions construye la imagen OCI y la publica en GitHub Container Registry con etiquetas de rama y commit. La rama principal también publica la etiqueta `latest`.

### Vercel

El repositorio incluye `vercel.json` con el fallback necesario para que las rutas de React Router funcionen al accederlas directamente. En Vercel deben configurarse `VITE_API_BASE_URL` y `VITE_CLIENT_ID` antes del build.

## Integración y entrega continua

Los workflows ubicados en `.github/workflows/` ejecutan:

- lint, pruebas con cobertura y build de producción;
- análisis de calidad con SonarCloud;
- detección de secretos con Gitleaks;
- análisis de infraestructura e imagen con Trivy;
- prueba de humo mediante Docker Compose;
- publicación de la imagen en GHCR para las referencias habilitadas.

Los pull requests hacia `main` y `develop` ejecutan validaciones sin publicar una imagen. Los pushes a estas ramas ejecutan CI; la publicación se habilita para `main` y para ejecuciones sobre referencias `release`.

## Documentación

- [Guía de arquitectura](docs/guides/frontend-architecture.md): estructura, flujos internos y ubicación de responsabilidades.
- [Guía para crear una feature](docs/guides/create-new-feature.md): pasos para incorporar pantallas e integraciones.
- [Convenciones de código](docs/guides/style-guide.md): nomenclatura, TypeScript, React y pruebas.
- [ADRs](docs/adr/): decisiones base sobre React, Vite, Tailwind/shadcn y arquitectura Feature-Driven.

## Consideraciones de seguridad

- Los tokens no se persisten en el almacenamiento del navegador.
- El refresh se coordina para evitar solicitudes simultáneas y cada request se reintenta como máximo una vez.
- La caché de datos se limpia al finalizar o invalidar una sesión.
- Las variables `VITE_*` son públicas y nunca deben almacenar secretos.
- Las verificaciones del JWT en el frontend no sustituyen la validación criptográfica y autorización del backend.
- La imagen de Nginx se ejecuta sin privilegios y sirve archivos con permisos de solo lectura.

## Equipo — Grupo 2

| Integrante | Rol | Módulo |
|---|---|---|
| Abeledo, Federico | Project Manager | Login Federado |
| Francisco Frate, Delfina | Scrum Master | Login Federado |
| Hernandez, Nicolas | Backend | Login Federado |
| Opatich, Ignacio | Frontend | Login Federado |
| Ravaschio, Guido | DevOps | Login Federado |
| Wu, Antonio | Security / Backend | Login Federado |
