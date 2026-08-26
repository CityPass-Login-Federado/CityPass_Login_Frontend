# ADR-011: Arquitectura Feature-Driven para el Frontend

## Estado: Aceptado

## Contexto
Para obtener los 10 puntos de la dimensión "Diseño de Arquitectura", necesitamos una estructura de proyecto que garantice modularidad interna y una correcta separación de responsabilidades. A medida que el módulo crezca (login, validación, gestión de sesiones, logs de auditoría), el código debe mantenerse ordenado.

## Opciones consideradas

### Opción A: Arquitectura Type-Driven (Agrupación por tipo)
*(Ej: Todas las views juntas, todos los hooks juntos, todos los services juntos)*
| Pros | Contras |
|------|---------|
| Fácil de entender al principio | Alta fricción al escalar (archivos relacionados muy separados) |
| Tradicional en proyectos pequeños | Difícil eliminar o extraer una funcionalidad completa |

### Opción B: Arquitectura Feature-Driven (Agrupación por dominio) (Elegida)
*(Ej: Agrupar por `auth`, `roles`, `audit`)*
| Pros | Contras |
|------|---------|
| Alta cohesión: todo lo relacionado a "login" vive en la misma carpeta | Requiere disciplina para no cruzar dependencias entre features |
| Facilita la escalabilidad y el mantenimiento | Estructura inicial de carpetas un poco más profunda |
| Los tests de una feature viven al lado de su código fuente | |

## Decisión
**Opción B: Arquitectura Feature-Driven**
Adoptamos esta arquitectura para alinearnos con los requerimientos de modularidad y patrones adecuados exigidos en la rúbrica. Al encapsular dominios (como `/features/auth`), el código se vuelve altamente cohesivo. Si en el futuro se solicita integrar este frontend como un Micro-Frontend en la plataforma general CityPass+, la funcionalidad estará perfectamente aislada y lista para ser exportada.

## Consecuencias
- El código de negocio se organizará dentro de `src/features/`.
- Los tests unitarios y de componentes (Vitest) se ubicarán junto al archivo que testean (Colocación), facilitando alcanzar el 60% de cobertura.
- El estado global (Zustand) se limitará a datos compartidos (ej. la sesión activa), mientras que el estado de servidor se manejará con React Query dentro de cada feature.