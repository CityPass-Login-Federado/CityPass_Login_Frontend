# ADR-010: Tailwind CSS y Shadcn UI para el Sistema de Diseño

## Estado: Aceptado

## Contexto
La rúbrica del proyecto exige un prototipo funcional y evalúa la experiencia de usuario (UX/UI) del módulo con 10 puntos. El sistema debe verse moderno, ser responsivo y garantizar accesibilidad sin consumir todo el tiempo del sprint escribiendo CSS personalizado.

## Opciones consideradas

### Opción A: CSS puro / SASS Modules
| Pros | Contras |
|------|---------|
| Control absoluto píxel por píxel | Demasiado lento para el tiempo estipulado |
| Cero dependencias externas | Difícil de mantener consistente en todo el equipo |

### Opción B: Librerías de Componentes (MUI / Bootstrap)
| Pros | Contras |
|------|---------|
| Componentes listos para usar | Estética rígida (todos los sitios se ven iguales) |
| Rápidos de implementar | Sobrescribir estilos es muy complejo y propenso a errores |

### Opción C: Tailwind CSS + Shadcn UI (Elegida)
| Pros | Contras |
|------|---------|
| Estilos por utilidades (muy rápido de escribir) | El HTML puede quedar un poco verboso con muchas clases |
| Shadcn UI da control total (el código del componente te pertenece) | Requiere aprender la nomenclatura de clases de Tailwind |
| Accesibilidad nativa garantizada (Radix UI) | |

## Decisión
**Opción C: Tailwind CSS + Shadcn UI**
Elegimos este stack para asegurar los 10 puntos de la dimensión UX/UI. Shadcn no es una librería de NPM que se instala, sino código que se copia al proyecto, dándonos el 100% del control sobre el renderizado. Tailwind nos permitirá maquetar formularios de login responsivos a una velocidad mucho mayor que escribiendo CSS clásico.

## Consecuencias
- Todos los estilos se manejan mediante clases utilitarias de Tailwind.
- Los componentes base (botones, inputs, modales) vivirán en `src/components/ui/` y podrán ser modificados libremente.