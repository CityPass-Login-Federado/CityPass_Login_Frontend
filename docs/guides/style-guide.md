# Guía de Convenciones de Código (Coding Standards)

Este documento define las reglas de estilo y nomenclatura que todo el equipo del módulo Login Federado debe seguir para mantener un código limpio, predecible y profesional.

Estado: revisado contra el código el 14 de noviembre de 2026.

## 1. Idioma Estricto
* **Código en Inglés:** Absolutamente todo el código fuente (nombres de carpetas, archivos, variables, funciones, interfaces, clases y comentarios técnicos) debe escribirse en **inglés**.
* **UI en Español:** La única excepción son los textos literales (strings) que verá el ciudadano o administrador en la pantalla de CityPass+, los cuales deben estar en español.

## 2. Nomenclatura (Naming Conventions)
* **Carpetas y Archivos (no componentes):** `camelCase`. Ejemplos: `auth`, `roles`, `apiClient.ts`, `authService.ts`.
* **Clases, Interfaces y Tipos:** `PascalCase` (UpperCamelCase). Ejemplos: `LoginRequest`, `AuthService`, `UserProfile`. No utilizar el prefijo "I" para las interfaces (evitar `ILoginRequest`).
* **Documentación y archivos de texto:** `kebab-case`. Los ADR conservan el prefijo existente `ADR-F###-` por trazabilidad.
* **Componentes de React:** `PascalCase`. El archivo debe llamarse exactamente igual que el componente. Ejemplo: Archivo `LoginForm.tsx` exporta `const LoginForm = ...`.
* **Métodos y Funciones:** `camelCase` (lowerCamelCase). Deben representar acciones (verbos). Ejemplos: `handleLoginSubmit()`, `fetchUserData()`, `formatDate()`.
* **Variables y Atributos:** `camelCase`. Ejemplos: `accessToken`, `isLoading`, `userData`.
* **Constantes Globales:** `UPPER_SNAKE_CASE`. Aplica para valores fijos, configuraciones o variables de entorno. Ejemplos: `MAX_LOGIN_ATTEMPTS`, `API_BASE_URL`. *(Nota: Las variables locales inmutables declaradas con `const` dentro de una función mantienen `camelCase`)*.

## 3. Reglas Específicas de React y TypeScript
* **Hooks Personalizados:** Todo custom hook debe comenzar con la palabra `use` en `camelCase`. Ejemplo: `useAuthStore()`, `useCreateUser()`.
* **Booleanos:** Las variables o propiedades booleanas deben formularse como preguntas o estados usando prefijos como `is`, `has`, `should`. Ejemplos: `isAuthenticated`, `isLoading`, `hasError`.
* **Event Handlers:** Las funciones que manejan eventos en la UI deben usar el prefijo `handle`. Ejemplos: `handleEmailChange`, `handleFormSubmit`. Las propiedades (props) que reciben estas funciones deben usar el prefijo `on`. Ejemplos: `onSubmit`, `onClick`.
* **Exportaciones (Exports):** Utilizar siempre **Named Exports** en lugar de `export default`. Esto mejora el autocompletado en el IDE, facilita la refactorización y obliga a todo el equipo a importar el componente con el mismo nombre exacto.
  * Incorrecto: `export default LoginForm;`
  * Correcto: `export const LoginForm = () => { ... }`
  * Excepción: declaraciones de módulos de assets en `src/types/assets.d.ts`, donde `export default` modela el comportamiento del import estático.

## 4. Arquitectura y Estructura
* **Tipado Estricto:** Evitar el uso de `any` bajo cualquier circunstancia. Si no se conoce el tipo exacto, utilizar `unknown` o definir la interfaz correspondiente basándose en el contrato OpenAPI.
* **Importaciones Limpias:** Priorizar el uso de alias de rutas (Absolute Imports) configurados en Vite (ej: `@/features/auth/pages`) en lugar de rutas relativas largas y confusas (`../../../../features/`).
* **Estilos:** No utilizar estilos en línea (`style={{ color: 'red' }}`). Todos los estilos deben aplicarse mediante clases utilitarias de Tailwind CSS a través de la propiedad `className`.
* **Contratos HTTP:** No inventar endpoints ni DTO. Verificar controller/OpenAPI real y agregar una prueba de método, ruta y payload. Hoy existen divergencias conocidas entre las rutas inglesas del panel frontend y las rutas españolas del backend.
* **Estado remoto:** Mantenerlo en TanStack Query. Zustand queda reservado al estado compartido de sesión; no duplicar respuestas HTTP en stores locales.
* **Tokens:** No persistir access o refresh tokens en `localStorage` o `sessionStorage` sin una nueva decisión de arquitectura y revisión de amenazas.

## 5. Testing
* **Colocación:** Los archivos de test deben vivir exactamente en la misma carpeta que el archivo que están probando y usar el sufijo `.test.tsx` o `.test.ts`. Ejemplo: `LoginForm.tsx` y `LoginForm.test.tsx` en el mismo directorio.
* **Comportamiento observable:** Priorizar roles, labels y efectos visibles sobre detalles internos de implementación.
* **Contrato:** Las funciones de `api/` deben probar método, ruta, parámetros y cuerpo exactos.
* **Calidad mínima:** `vitest.config.ts` exige 60 % en statements, branches, functions y lines.

## 6. Validación antes del commit

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```
