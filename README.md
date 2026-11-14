# CityPass+ — Login Federado Frontend

Aplicación web del Squad 2 para autenticación y administración de identidades de CityPass+. Implementa login, custodia de tokens en memoria, renovación automática y una interfaz de gestión de personas, grupos y membresías.

> Estado auditado: 14 de noviembre de 2026. Las pantallas y clientes HTTP se describen tal como están en el código; la compatibilidad incompleta con el backend se detalla abajo.

## Stack exacto

| Área | Versión declarada |
|---|---|
| Runtime de build | Node.js 22 (`node:22-alpine`) |
| React / React DOM | 18.3.1 |
| TypeScript | 5.6.x |
| Vite | 5.4.x |
| React Router | 7.1.x |
| TanStack Query | 5.62.x |
| Zustand | 5.0.x |
| Axios | 1.7.x |
| React Hook Form / Zod | 7.54.x / 3.24.x |
| Tailwind CSS | 3.4.x |
| Vitest / Testing Library | 2.1.x / React 16.1.x |
| Runtime OCI | Nginx 1.27 Alpine, usuario no root |

Los rangos provienen de `package.json`; no existe `package-lock.json`, de modo que una instalación nueva no fija versiones transitivas exactas.

## Inicio local

Requisitos: Node.js 22, npm y backend accesible en `http://127.0.0.1:8081`.

```bash
npm install
```

Cree `.env`:

```dotenv
VITE_API_BASE_URL=/api
VITE_CLIENT_ID=citypass-admin-web
```

```bash
npm run dev
```

Abra `http://localhost:5173`. El proxy de Vite elimina `/api` y reenvía a `http://127.0.0.1:8081`.

### Docker

```bash
docker compose up -d --build
docker compose ps
```

El host publica `5173` y Nginx escucha en `8080` dentro del contenedor. `FRONTEND_PORT` permite cambiar el puerto host. `VITE_API_BASE_URL` es una variable de build: hay que reconstruir la imagen para cambiarla.

## Scripts

| Comando | Propósito |
|---|---|
| `npm run dev` | Vite con HMR |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emisión |
| `npm test` | suite Vitest una vez |
| `npm run test:watch` | Vitest interactivo |
| `npm run test:coverage` | cobertura V8, umbral 60 % en las cuatro métricas |
| `npm run build` | typecheck y bundle de producción |
| `npm run preview` | preview del bundle |

Validación recomendada:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
docker compose up -d --build --wait
```

## Arquitectura y seguridad del cliente

La organización es Feature-Driven:

```text
src/
├── components/ui/              # primitivas visuales compartidas
├── features/auth/              # login, refresh, logout, JWT y guards
├── features/systemManagement/  # personas, grupos y membresías
├── lib/axios.ts                # interceptores y coordinación de refresh
└── App.tsx                     # rutas y providers
```

- Access y refresh token se guardan únicamente en memoria; recargar la página obliga a iniciar sesión otra vez.
- El cliente renueva 30 segundos antes del vencimiento y usa una única promesa de refresh para solicitudes concurrentes.
- Un `401` protegido produce un solo refresh y reintento.
- El frontend decodifica claims para navegación, pero no verifica la firma: el backend sigue siendo la frontera de autorización.
- El panel exige `aud=citypass-admin-api`, `token_use=human`, `ver=1` y grupo `delegados`, salvo los roles de administrador general reconocidos solo por la UI.

## Rutas de UI

| Ruta | Estado |
|---|---|
| `/login` | operativa contra `POST /auth/login` |
| `/home` | área autenticada básica |
| `/panel`, `/panel/users`, `/panel/groups` | UI implementada; integración backend incompatible en varias rutas |
| `/forgot-password`, `/reset-password` | UI implementada; endpoints backend ausentes |
| `/unauthorized` | feedback de autorización |

## Contrato con el backend: estado auditado

La autenticación coincide en `POST /auth/login`, `POST /auth/refresh` y `POST /auth/logout`, incluidos los campos camelCase de request y snake_case de response.

El panel no es interoperable en el estado actual:

| Frontend solicita | Backend publica | Estado |
|---|---|---|
| `/panel/people` | `/panel/personas` | incompatible |
| `/panel/groups` | `/panel/grupos` | incompatible |
| `/members` | `/miembros` | incompatible |
| `/panel/modules` | — | ausente |
| `/panel/admin/people`, `/panel/admin/groups` | — | ausente |
| `/panel/group-memberships/bulk` | — | ausente |
| `/auth/forgot-password`, `/auth/reset-password`, `/me/change-password` | — | ausentes |

Además, el frontend admite filtros, paginación y parámetro `module`; el backend devuelve listas completas y deriva el módulo exclusivamente del JWT. Hasta unificar el contrato, solo debe considerarse integrada la autenticación.

## CI/CD

- `pr-checks.yml`: CI y smoke test Docker Compose en PRs a `main` y `develop`.
- `CI.yml`: lint, cobertura, build, SonarCloud, Gitleaks y Trivy.
- `push-checks.yml`: CI seguido de CD en pushes a `main` y `develop`.
- `CD.yml`: artefacto inmutable de Vercel e imagen publicada en GHCR.
- `manual-deploy.yml`: despliegue a Vercel de un artefacto previamente validado.

El smoke test comprueba que Nginx sirve HTML; no prueba login ni compatibilidad con el backend.

## Credenciales de desarrollo

Con el backend seed, use `delegado-rec` / `changeit123` y `VITE_CLIENT_ID=citypass-admin-web`. Estas credenciales no son aptas para ambientes compartidos.

## Documentación

- `docs/guides/frontend-architecture.md`
- `docs/guides/create-new-feature.md`
- `docs/guides/style-guide.md`
- `docs/adr/`
- Documentación integral y diagramas: carpeta `login-federado/docs/` del repositorio backend.
