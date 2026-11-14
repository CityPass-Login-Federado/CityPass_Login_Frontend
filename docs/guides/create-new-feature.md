# Guía para agregar una pantalla o caso de uso

Esta guía describe el flujo real del repositorio. No presupone que un endpoint existe: antes de programar una integración se debe comprobar el contrato backend.

## 1. Confirmar el contrato

1. Verificar método, ruta, request, response y errores en el OpenAPI o controller real.
2. Comprobar autorización y claims necesarios.
3. Acordar paginación, filtros y nombres antes de escribir el cliente.
4. Añadir una prueba de contrato o, como mínimo, un test del cliente HTTP.

Esta verificación es obligatoria porque actualmente hay divergencias conocidas:

| Frontend actual | Backend actual |
|---|---|
| `/panel/people` | `/panel/personas` |
| `/panel/groups` | `/panel/grupos` |
| `/members` | `/miembros` |
| módulos, administración global y bulk | sin endpoint |
| forgot/reset/change password | sin endpoint |

No se debe copiar una ruta ilustrativa ni crear una interfaz imaginaria para “completar” una pantalla.

## 2. Elegir la feature

- Login, sesión, JWT o contraseñas: `src/features/auth/`.
- Personas, grupos o membresías: `src/features/systemManagement/`.
- Cree otra carpeta en `src/features/` solo para un dominio nuevo.

Las subcarpetas se agregan por necesidad. La estructura real es:

```text
auth/
├── api/ forms/ hooks/ layout/ pages/
├── routing/ session/ store/ types/ utils/

systemManagement/
├── api/ components/ hooks/ pages/
├── schemas/ types/ utils/
```

## 3. Modelar tipos y validación

- Declare request, response y variables de mutación en `types/`.
- Respete exactamente camelCase/snake_case y nulabilidad del contrato.
- Use Zod para datos ingresados por el usuario.
- No reutilice el tipo visual si la respuesta HTTP tiene otra forma: normalícela en `api/` o `utils/`.

Ejemplo basado en el patrón real:

```typescript
export interface CreatePersonRequest {
  givenName: string;
  sn: string;
  username: string;
  email: string;
  temporaryPassword: string;
}
```

## 4. Implementar acceso HTTP

Las llamadas viven en `api/`, nunca dentro de componentes:

```typescript
export const createPerson = async (
  variables: CreatePersonVariables,
): Promise<PanelPerson> => {
  const response = await axiosInstance.post<PanelPerson>(
    '/ruta-acordada-en-el-contrato',
    variables.data,
  );
  return response.data;
};
```

Use `axiosInstance` para endpoints protegidos. `authAxiosInstance` queda reservado al refresh para evitar ciclos de interceptores.

## 5. Crear query o mutación

- Use TanStack Query para datos remotos.
- Defina claves en `systemManagement/utils/queryKeys.ts` cuando corresponda.
- Centralice invalidación/reconciliación en `cacheReconciliation.ts`.
- No duplique respuestas remotas en Zustand; el store actual se limita a la sesión.

## 6. Construir la interfaz

- Componentes de negocio dentro de su feature.
- Primitivas visuales sin conocimiento del dominio en `src/components/ui/`.
- React Hook Form + Zod para formularios.
- Estados visibles de carga, vacío, error y éxito.
- Etiquetas, roles accesibles, foco y navegación por teclado.

## 7. Registrar la ruta

Las rutas viven en `src/App.tsx`:

- Pública: ruta directa.
- Solo autenticada: debajo de `AuthenticatedRoute`.
- Panel administrativo: debajo de `ProtectedRoute`.

La protección del frontend mejora la navegación, pero el backend debe volver a autorizar cada request.

## 8. Escribir pruebas

Coloque `.test.ts` o `.test.tsx` junto al código. Según el cambio, cubra:

- esquema/utilidad como función pura;
- cliente HTTP con método, ruta y payload exactos;
- hook con `QueryClientProvider` aislado;
- componente por comportamiento y roles accesibles;
- routing con sesiones permitidas y rechazadas;
- invalidación de todas las cachés afectadas.

## 9. Validar antes del commit

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Checklist:

- [ ] El endpoint existe y coincide con backend/OpenAPI.
- [ ] No se inventaron campos ni permisos.
- [ ] API, hook, query key e invalidación están separados.
- [ ] La UI cubre loading, empty, error y success.
- [ ] La autorización existe también en backend.
- [ ] Los tests cubren contrato y comportamiento.
- [ ] La cobertura global conserva el umbral de 60 %.
