# Guía de arquitectura del frontend

Esta guía describe cómo está organizado el frontend de CityPass+ Login Federado, cómo circulan los datos y dónde buscar o agregar cada tipo de comportamiento. Su objetivo es servir como mapa técnico del estado actual del proyecto.

## 1. Vista general

La aplicación es una SPA desarrollada con React 18, TypeScript y Vite. El código de negocio se organiza por funcionalidades y se apoya en una capa compartida pequeña:

```text
src/
├── assets/                    # Imágenes y recursos estáticos
├── components/
│   ├── ui/                    # Componentes visuales reutilizables
│   └── AppErrorBoundary.tsx   # Límite global de errores del panel
├── features/
│   ├── auth/                  # Autenticación, sesión y contraseñas
│   └── systemManagement/      # Administración de usuarios y grupos
├── lib/
│   ├── axios.ts               # Cliente HTTP e interceptores de autenticación
│   ├── queryClient.ts         # Configuración compartida de TanStack Query
│   └── utils.ts               # Utilidades transversales de interfaz
├── tests/
│   └── setup.ts               # Configuración global de Vitest
├── App.tsx                    # Providers, rutas públicas y rutas protegidas
├── index.css                  # Tailwind, variables del tema y estilos base
└── main.tsx                   # Punto de entrada de React
```

Las responsabilidades se separan de esta manera:

| Necesidad | Responsable |
|---|---|
| Renderizado y estado efímero de una pantalla | React y hooks locales |
| Formularios | React Hook Form |
| Validación de formularios | Zod |
| Estado compartido de la sesión | Zustand |
| Datos remotos, caché y mutaciones | TanStack Query |
| Transporte HTTP y renovación de tokens | Axios |
| Rutas y navegación | React Router |
| Estilos y componentes base | Tailwind CSS y shadcn/ui |

## 2. Puntos de entrada y navegación

### `src/main.tsx`

Es el punto de entrada del navegador. Sus responsabilidades son limitadas:

- habilitar React en modo estricto;
- cargar los estilos globales;
- inicializar Vercel Speed Insights;
- renderizar `App` en el elemento raíz.

### `src/App.tsx`

Es el mapa de navegación de la aplicación. Aquí se encuentran:

- `QueryClientProvider`, que habilita TanStack Query;
- `BrowserRouter`, que habilita las rutas del cliente;
- las rutas públicas de login y recuperación de contraseña;
- las rutas administrativas envueltas por `ProtectedRoute`;
- el `Toaster` global;
- los límites de errores de las pantallas protegidas.

Las rutas actuales son:

| Ruta | Acceso | Componente principal |
|---|---|---|
| `/login` | Público | `LoginPage` |
| `/forgot-password` | Público | `ForgotPasswordPage` |
| `/reset-password` | Público | `PasswordResetPage` |
| `/unauthorized` | Público | `UnauthorizedPage` |
| `/panel` | Protegido | `SystemManagementPage` |
| `/panel/users` | Protegido | `UsersManagementPage` |
| `/panel/groups` | Protegido | `GroupsManagementPage` |

Cualquier ruta desconocida redirige a `/login`. Para agregar una pantalla nueva se debe registrar su ruta en `App.tsx`; actualmente no existe un archivo `AppRouter.tsx` separado.

## 3. Feature de autenticación

Todo lo relacionado con identidad y sesión vive en `src/features/auth/`.

```text
auth/
├── api/          # Login, logout y operaciones de contraseña
├── components/   # Pantallas, formularios, menú y protección de rutas
├── hooks/        # Mutaciones y efectos de navegación
├── session/      # Custodia de tokens y creación de la sesión
├── store/        # Estado compartido de autenticación
├── types/        # Contratos de la API, claims y modelo de sesión
└── utils/        # JWT, validaciones y traducción de errores
```

### Flujo de inicio de sesión

```text
LoginForm
  → useLogin
  → loginUser
  → POST /auth/login
  → establishSession
  → tokenVault + useAuthStore
  → navegación a /panel
```

1. `LoginForm` valida los datos y ejecuta `useLogin`.
2. `loginUser` envía las credenciales mediante la instancia compartida de Axios.
3. `establishSession` interpreta el access token y comprueba el contrato mínimo esperado: expiración, audiencia, tipo de token y versión.
4. `tokenVault.ts` conserva el access token y el refresh token únicamente en memoria.
5. `useAuthStore.ts` conserva los datos necesarios para la interfaz: usuario, módulo, grupos, roles, alcance administrativo y vencimiento.
6. Después del éxito, React Router navega a `/panel`.

El frontend decodifica claims para construir la interfaz, pero no verifica la firma criptográfica del JWT. La API es siempre la responsable final de autenticar y autorizar cada operación.

### Persistencia de la sesión

Los tokens no se guardan en `localStorage` ni en `sessionStorage`. Una recarga completa de la página elimina la sesión en memoria y obliga a iniciar sesión nuevamente. `useAuthStore` también elimina claves heredadas de tokens que pudieran existir en `localStorage`.

Esta es una decisión deliberada para no mantener credenciales persistentes accesibles desde JavaScript.

### Solicitudes autenticadas y renovación

La lógica transversal está en `src/lib/axios.ts`:

1. El interceptor de solicitudes agrega `Authorization: Bearer <accessToken>` a las llamadas protegidas.
2. Si el token vence dentro de los próximos 30 segundos, intenta renovarlo antes de enviar la solicitud.
3. Si una respuesta protegida devuelve `401`, renueva el token y reintenta la solicitud original una sola vez.
4. Las solicitudes de renovación concurrentes comparten la misma promesa para evitar múltiples refresh simultáneos.
5. Si la renovación falla por credenciales inválidas o sin autorización, se limpian la sesión y la caché remota.

Las llamadas cuyo path comienza con `/auth/` se consideran públicas para los interceptores y no reciben el encabezado Bearer automáticamente.

### Autorización de rutas

`ProtectedRoute.tsx` consulta `useAuthStore` y aplica estas reglas:

- sin sesión: redirección a `/login`;
- administrador general: acceso al panel;
- administrador de módulo: requiere un módulo y pertenecer al grupo `delegados`;
- sesión válida sin permisos de panel: redirección a `/unauthorized`.

Estas verificaciones controlan la experiencia de navegación. No reemplazan los controles de autorización del backend.

### Logout y cambios de contraseña

`useLogout` intenta revocar el refresh token en el backend. Tanto si esa llamada funciona como si falla, limpia los tokens, la sesión y la caché de TanStack Query antes de volver al login.

Un cambio o restablecimiento exitoso de contraseña también limpia la sesión y exige una nueva autenticación.

## 4. Feature de administración del sistema

La administración de usuarios, grupos y membresías vive en `src/features/systemManagement/`.

```text
systemManagement/
├── api/
│   └── panelApi.ts              # Todas las llamadas del panel
├── components/                  # Páginas, secciones, tablas, filtros y diálogos
├── hooks/
│   ├── usePeople.ts             # Consultas y mutaciones de usuarios
│   ├── useGroups.ts             # Consultas y mutaciones de grupos
│   └── useDebouncedValue.ts     # Demora búsquedas antes de consultar
├── schemas/
│   └── systemManagementSchemas.ts
├── types/
│   └── index.ts                 # DTOs, filtros y modelos del panel
└── utils/
    ├── cacheReconciliation.ts   # Invalidación posterior a mutaciones
    ├── errors.ts                # Mensajes de error del panel
    ├── groups.ts                # Nombres y claves de grupos
    ├── modules.ts               # Catálogo y nombres de módulos
    ├── pagination.ts            # Normalización de respuestas paginadas
    └── queryKeys.ts             # Claves de caché de TanStack Query
```

### Organización de las pantallas

- Las páginas `*ManagementPage` obtienen la sesión necesaria y componen el layout.
- `ManagementPageLayout` contiene la estructura compartida, la navegación lateral y el menú del usuario.
- `UsersSection` y `GroupsSection` coordinan filtros, paginación, consultas y diálogos.
- `UsersTable` y `GroupsTable` se ocupan de presentar filas y acciones.
- Los componentes `*Dialog` contienen formularios o confirmaciones específicas.
- `SectionState` y `TablePagination` resuelven estados visuales reutilizados por ambas secciones.

Los componentes de `systemManagement` pueden consumir sesión y permisos desde `auth`. Esa dependencia es intencional; las features están separadas por responsabilidad, pero no son micro-frontends independientes.

## 5. Flujo de datos del panel

### Consultas

```text
Componente
  → hook usePeople/useGroups
  → función de panelApi
  → axiosInstance
  → backend
  → caché de TanStack Query
  → renderizado
```

Los componentes no deberían llamar a Axios directamente. La función de `api/` conoce el endpoint y el hook de `hooks/` conoce la caché, los estados de carga y las mutaciones.

`queryKeys.ts` define claves jerárquicas y deterministas. Los parámetros de búsqueda, página, tamaño, módulo y filtros forman parte de la clave, por lo que cada combinación mantiene su propio resultado en caché.

Las listas paginadas conservan temporalmente la página anterior mediante `keepPreviousData`; esto evita que la tabla desaparezca mientras se solicita la página siguiente.

### Mutaciones y reconciliación

Después de crear o modificar datos, los hooks invalidan las consultas relacionadas:

- cambios exclusivos de grupos invalidan `groups`;
- cambios de usuarios o membresías invalidan `people` y `groups`;
- la reconciliación se ejecuta en `onSettled`, para volver a consultar incluso si la respuesta fue incierta.

La lógica está centralizada en `cacheReconciliation.ts`. Si se agrega una entidad nueva, también se deben definir sus query keys y su estrategia de invalidación.

## 6. Formularios y validación

Los formularios siguen este reparto:

- React Hook Form registra campos y administra envío, errores y estado del formulario.
- Zod define las reglas de validación en archivos de esquemas o utilidades de la feature.
- `@hookform/resolvers` conecta ambos.
- TanStack Query ejecuta la mutación una vez que los datos son válidos.
- Los errores del backend se transforman en mensajes aptos para la interfaz mediante las utilidades de errores.

Los esquemas del panel están en `systemManagement/schemas/`. Los esquemas de login y contraseña están en `auth/utils/`.

## 7. Componentes compartidos y estilos

`src/components/ui/` contiene los componentes base incorporados a partir de shadcn/ui, como botones, inputs, diálogos, tablas y selects. Estos archivos forman parte del proyecto y pueden modificarse.

Una pieza debe vivir en `components/ui/` solamente si es visual, reutilizable y no conoce reglas de negocio. Si conoce usuarios, grupos, permisos o autenticación, pertenece a la feature correspondiente.

Los estilos se construyen principalmente con clases de Tailwind:

- `src/index.css` define las variables globales del tema y estilos base;
- `tailwind.config.js` conecta esas variables con utilidades y tipografías;
- `src/lib/utils.ts` contiene la utilidad para combinar clases.

El uso de primitivas de Radix aporta comportamientos accesibles de base, pero cada pantalla debe conservar etiquetas, foco, navegación por teclado, contraste y mensajes de error adecuados.

## 8. Dónde realizar cada cambio

| Si necesitás... | Empezá por... | Revisá también... |
|---|---|---|
| Agregar o cambiar una ruta | `src/App.tsx` | `ProtectedRoute.tsx` si requiere sesión |
| Modificar el login | `auth/components/LoginForm.tsx` | `useLogin.ts`, `api/login.ts` y el esquema de login |
| Cambiar cómo se guardan los tokens | `auth/session/tokenVault.ts` | `sessionManager.ts`, `useAuthStore.ts` y `lib/axios.ts` |
| Cambiar permisos del panel | `auth/store/useAuthStore.ts` | `auth/utils/jwt.ts` y `ProtectedRoute.tsx` |
| Agregar un endpoint de autenticación | `auth/api/` | su hook, tipos y pruebas |
| Agregar un endpoint del panel | `systemManagement/api/panelApi.ts` | tipos, hooks, query keys e invalidación |
| Cambiar la lista de usuarios | `UsersSection.tsx` | `UsersTable.tsx`, `UserFilters.tsx` y `usePeople.ts` |
| Cambiar la lista de grupos | `GroupsSection.tsx` | `GroupsTable.tsx`, `GroupFilters.tsx` y `useGroups.ts` |
| Cambiar un formulario del panel | componente `*Dialog.tsx` | `systemManagementSchemas.ts` y hook de mutación |
| Agregar estado remoto | hook de la feature | `queryKeys.ts` y `cacheReconciliation.ts` |
| Agregar estado compartido del cliente | store de la feature | confirmar que no sea estado remoto ni local |
| Crear un componente visual genérico | `src/components/ui/` | tema global y pruebas del componente |
| Cambiar URL o comportamiento HTTP | `src/lib/axios.ts` | `.env`, Vite, Nginx y pruebas de autenticación |
| Cambiar el empaquetado | `vite.config.ts` o `Dockerfile` | `nginx.conf`, `vercel.json` y workflows |

## 9. Cómo agregar un caso de uso

Para incorporar una operación nueva dentro de una feature existente:

1. Definir o actualizar los tipos que representan el contrato del backend.
2. Agregar una función en `api/` que reciba datos tipados y devuelva la respuesta normalizada.
3. Crear o ampliar un hook de TanStack Query.
4. Definir la query key y la reconciliación necesaria si afecta datos remotos.
5. Agregar el esquema Zod si existe entrada del usuario.
6. Implementar el componente de negocio usando el hook, sin llamar directamente a Axios.
7. Registrar la ruta en `App.tsx` si se trata de una página nueva.
8. Agregar pruebas junto a los archivos afectados.

Si el caso de uso pertenece a un dominio nuevo, se crea una carpeta dentro de `src/features/` y se agregan únicamente las subcarpetas que ese dominio necesite.

## 10. Pruebas

Vitest y React Testing Library cubren componentes, hooks y utilidades. Los tests se colocan junto al código probado con el sufijo `.test.ts` o `.test.tsx`.

Las pruebas suelen dividirse en:

- utilidades y esquemas como funciones puras;
- componentes mediante comportamiento visible y roles accesibles;
- hooks mediante providers aislados de TanStack Query;
- APIs mediante mocks del cliente HTTP;
- routing y permisos mediante sesiones controladas.

La configuración global está en `vitest.config.ts` y `src/tests/setup.ts`.

Comandos habituales:

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

## 11. Build, ejecución y despliegue

### Desarrollo local

Vite ejecuta el frontend en el puerto `5173`. En desarrollo, las llamadas a `/api` se redirigen al backend configurado en `vite.config.ts`.

### Contenedor

El `Dockerfile` tiene dos etapas:

1. Node.js instala dependencias y ejecuta `npm run build`.
2. Nginx sirve el contenido de `dist/` como usuario no privilegiado en el puerto `8080`.

`nginx.conf` aplica el fallback a `index.html` para React Router y puede actuar como proxy de `/api/`. `docker-compose.yml` construye y expone localmente la imagen.

### Vercel

`vercel.json` redirige las rutas del navegador a `index.html`. En este modo, `VITE_API_BASE_URL` debe apuntar a una API accesible desde el navegador.

Las variables `VITE_*` se reemplazan durante el build. Cambiar una variable solamente en un contenedor ya construido no modifica los archivos JavaScript existentes: se debe generar un nuevo build.

### Integración y entrega continua

Los workflows de `.github/workflows/` realizan:

- lint, pruebas con cobertura y build;
- análisis de SonarCloud;
- búsqueda de secretos con Gitleaks;
- análisis de configuración e imagen con Trivy;
- prueba de humo con Docker Compose;
- publicación de la imagen en GHCR para las referencias habilitadas.

## 12. Reglas que conviene preservar

- Mantener las reglas de negocio dentro de su feature.
- No llamar a Axios directamente desde componentes.
- No duplicar datos de TanStack Query en Zustand.
- No persistir tokens en almacenamiento del navegador sin revisar la estrategia completa de seguridad.
- Limpiar la caché cuando finaliza o se invalida una sesión.
- Usar query keys centralizadas e invalidar todas las vistas afectadas por una mutación.
- Tratar la autorización del frontend como una ayuda de navegación, nunca como sustituto del backend.
- Mantener juntos el archivo implementado y sus pruebas.
- Agregar a `components/ui/` solamente piezas visuales sin conocimiento del negocio.

## 13. Documentación relacionada

- `docs/adr/`: decisiones originales de React, Vite, Tailwind/shadcn y organización por features.
- `docs/guides/create-new-feature.md`: checklist orientado a crear una pantalla o feature.
- `docs/guides/style-guide.md`: convenciones de código, nombres e importaciones.
- `README.md`: propósito del proyecto, stack e instrucciones generales de ejecución.
