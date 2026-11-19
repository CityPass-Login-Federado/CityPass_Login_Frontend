# ADR-F004: Arquitectura Feature-Driven para el frontend

## Quiénes

| Nombre | Rol |
|---|---|
| Ignacio Opatich | Frontend |
| Delfina Francisco Frate | Documentación y revisión |

## Estado

Accepted — revisado el 19 de noviembre de 2026.

## Contexto
El frontend reúne tres dominios: autenticación (`auth`), administración
(`systemManagement`) y consulta del tablero externo (`analytics`). Cada dominio
contiene las piezas que evolucionan de manera relacionada. Analítica se mantiene
pequeña porque el backend de Login actúa como proxy y el frontend solamente
autoriza la ruta, obtiene el HTML y lo presenta dentro de un iframe aislado.

Necesitamos una estructura que mantenga próximas esas piezas, evite carpetas globales organizadas únicamente por tipo técnico y establezca un lugar claro para la infraestructura y los componentes compartidos.

## Opciones consideradas

### Opción A: Arquitectura Type-Driven (Agrupación por tipo)
*(Ej: Todas las views juntas, todos los hooks juntos, todos los services juntos)*
| Pros | Contras |
|------|---------|
| Fácil de entender al principio | Alta fricción al escalar (archivos relacionados muy separados) |
| Tradicional en proyectos pequeños | Difícil eliminar o extraer una funcionalidad completa |

### Opción B: Arquitectura Feature-Driven (Agrupación por dominio) (Elegida)
*(Ej: Agrupar por `auth`, `systemManagement` y `analytics`)*
| Pros | Contras |
|------|---------|
| Alta cohesión: todo lo relacionado a "login" vive en la misma carpeta | Requiere disciplina para no cruzar dependencias entre features |
| Facilita la escalabilidad y el mantenimiento | Estructura inicial de carpetas un poco más profunda |
| Los tests de una feature viven al lado de su código fuente | |

## Decisión
**Opción B: Arquitectura Feature-Driven**
Adoptamos esta arquitectura para que cada dominio concentre su interfaz, lógica, acceso a datos y pruebas. La organización por funcionalidades mejora la cohesión y permite que los cambios de autenticación y administración evolucionen con límites reconocibles.

Esta decisión no implica que las features sean micro-frontends independientes. Las dependencias entre dominios deben ser explícitas —por ejemplo, las pantallas de administración dependen de la sesión y de los permisos definidos en `auth`— y la infraestructura transversal debe permanecer fuera de las features.

## Consecuencias
- El código de negocio se organizará dentro de `src/features/`.
- `auth` usa `api`, `forms`, `hooks`, `layout`, `pages`, `routing`, `session`, `store`, `types` y `utils`.
- `systemManagement` usa `api`, `components`, `hooks`, `pages`, `schemas`, `types` y `utils`.
- `analytics` usa `api`, `hooks` y `pages`; depende de la sesión de `auth`
  y no accede directamente al backend del Grupo 8.
- Los componentes visuales reutilizables viven en `src/components/ui/` y la infraestructura compartida, como Axios y TanStack Query, en `src/lib/`.
- Los tests unitarios y de componentes con Vitest se ubican junto al archivo o área que prueban.
- Zustand se limita al estado compartido de la sesión, mientras que TanStack Query administra el estado obtenido del servidor.
- Las dependencias entre features deben mantenerse explícitas y justificadas; la organización por dominio no garantiza aislamiento automático.

## Referencias

- [Feature-Sliced Design: public API y aislamiento](https://feature-sliced.design/docs/reference/public-api)
- [TanStack Query](https://tanstack.com/query/latest)
- [Arquitectura del frontend](../guides/frontend-architecture.md)
- [Guía para crear una feature](../guides/create-new-feature.md)
