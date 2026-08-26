# Guía de Desarrollo: Cómo crear una nueva pantalla (Feature)

Esta guía detalla el flujo de trabajo estándar para agregar nuevas pantallas e integraciones en el Frontend de CityPass+ bajo nuestra arquitectura **Feature-Driven**.

## Paso 1: Identificar el Dominio (Feature)
Antes de crear un componente visual, debemos determinar a qué módulo de negocio pertenece la pantalla. 
* Si es el **Login**, pertenece a la feature `auth`.
* Si es el **Alta de usuarios Admin**, pertenece a la feature `users` (o `admin`).
* Si es el **Alta de grupos**, pertenece a la feature `roles` (o `groups`).

Si el dominio no existe, crea una nueva carpeta dentro de `src/features/`.

## Paso 2: Crear la estructura interna
Toda feature nueva debe respetar la siguiente estructura de carpetas interna:

```text
src/features/nombre-feature/
├── api/          # Funciones que usan Axios para llamar al backend
├── components/   # Componentes visuales exclusivos de esta feature
├── hooks/        # Custom hooks (ej. mutaciones de React Query)
├── store/        # Estado global local de la feature (Zustand) - Opcional
├── types/        # Interfaces y DTOs (Request/Response)
└── utils/        # Funciones auxiliares puras
```

## Paso 3: Definir los Contratos (Types)
Para cumplir con los 10 puntos de "Integración y APIs", nos basamos estrictamente en el contrato OpenAPI/Swagger del backend. 
Ve a `src/features/nombre-feature/types/index.ts` y define las interfaces.

**Ejemplo para "Alta de usuarios Admin":**
```typescript
// src/features/users/types/index.ts
export interface CreateAdminRequest {
  username: string;
  email: string;
  role: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}
```

## Paso 4: Capa de Acceso a Datos (API y Hooks)
Separamos la llamada HTTP de la lógica de React para abstraer el manejo asincrónico.

**1. Crear la llamada Axios (`api/`)**
```typescript
// src/features/users/api/createUser.ts
import { axiosInstance } from '@/lib/axios';
import { CreateAdminRequest, UserResponse } from '../types';

export const createAdminUser = async (data: CreateAdminRequest): Promise<UserResponse> => {
  const response = await axiosInstance.post('/admin/users', data);
  return response.data;
};
```

**2. Crear el Hook con React Query (`hooks/`)**
```typescript
// src/features/users/hooks/useCreateUser.ts
import { useMutation } from '@tanstack/react-query';
import { createAdminUser } from '../api/createUser';

export const useCreateUser = () => {
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      // Mostrar notificación de éxito, invalidar queries, etc.
    },
  });
};
```

## Paso 5: Maquetar la Interfaz (Componentes)
Diseñamos la pantalla usando **Tailwind CSS** y componentes de **Shadcn UI** ubicados en `src/components/ui/` para asegurar los 10 puntos correspondientes a la dimensión de "UX/UI del Módulo".

```tsx
// src/features/users/components/CreateAdminForm.tsx
import { useCreateUser } from '../hooks/useCreateUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CreateAdminForm = () => {
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mutar enviando los datos del form...
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border rounded-md">
      <h2 className="text-xl font-bold">Alta de Usuario Admin</h2>
      <Input name="username" placeholder="Nombre de usuario" required/>
      <Input name="email" placeholder="Correo electrónico" required type="email"/>
      <Button disabled={isPending} type="submit">
        {isPending ? 'Creando...' : 'Crear Usuario'}
      </Button>
    </form>
  );
};
```

## Paso 6: Registrar la Ruta
Para que la pantalla sea accesible, agrégala al enrutador principal en `src/routes/AppRouter.tsx`.

* Si es una pantalla protegida (como el Alta de Grupos o Usuarios), asegúrate de envolverla en un componente de protección de rutas (`<ProtectedRoute roles="{['ROLE_ADMIN']}"/>`) que valide el JWT antes de renderizarla. Esto es fundamental para cumplir con la consideración final del proyecto que indica que el login centralizado debe proteger todos los endpoints. 

## Paso 7: Escribir los Tests (Crucial)
La rúbrica exige un 60% de cobertura de pruebas automatizadas (unitarias e integrales). Por cada componente visual o hook complejo, crea un archivo `.test.tsx` junto al archivo original.

```tsx
// src/features/users/components/CreateAdminForm.test.tsx
import { render, screen } from '@testing-library/react';
import { CreateAdminForm } from './CreateAdminForm';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

test('renderiza el formulario de alta correctamente', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <CreateAdminForm/>
    </QueryClientProvider>
  );
  
  expect(screen.getByText(/Alta de Usuario Admin/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Nombre de usuario/i)).toBeInTheDocument();
});
```

---
**Checklist antes del Commit:**
- [ ] ¿Los Types coinciden con el OpenAPI/Swagger?
- [ ] ¿Se utilizó React Query para mutaciones/peticiones?
- [ ] ¿Los componentes usan las clases de Tailwind y base de Shadcn?
- [ ] ¿Se escribió el `.test.tsx` garantizando subir la cobertura?
- [ ] ¿La ruta está correctamente protegida (si aplica)?