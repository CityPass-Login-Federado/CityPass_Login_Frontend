# ADR-F003: Tailwind CSS y shadcn/ui para el sistema de diseño

## Estado: Aceptado

## Contexto
La aplicación incluye flujos públicos de autenticación y pantallas protegidas de gestión. Todas ellas necesitan una interfaz consistente, responsiva y mantenible, con componentes reutilizables y una base adecuada para implementar accesibilidad sin duplicar estilos.

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

### Opción C: Tailwind CSS + shadcn/ui (Elegida)
| Pros | Contras |
|------|---------|
| Estilos por utilidades (muy rápido de escribir) | El HTML puede quedar un poco verboso con muchas clases |
| shadcn/ui incorpora al repositorio el código de los componentes | Requiere mantener localmente esos componentes |
| Sus primitivas de Radix UI aportan comportamientos accesibles de base | La accesibilidad final depende de cómo se componga y pruebe cada pantalla |

## Decisión
**Opción C: Tailwind CSS + shadcn/ui**

Elegimos este stack para mantener una identidad visual consistente sin depender de una librería de componentes con estilos cerrados. Los componentes de shadcn/ui se incorporan al repositorio y pueden adaptarse a las necesidades del producto, mientras que Tailwind permite aplicar el sistema visual de manera uniforme en los flujos de autenticación y administración.

## Consecuencias
- Los estilos de las pantallas se expresan principalmente mediante clases utilitarias de Tailwind.
- Los tokens globales del tema y los estilos base se mantienen en `src/index.css` y `tailwind.config.js`.
- Los componentes reutilizables de interfaz viven en `src/components/ui/` y forman parte del código mantenido por el equipo.
- El uso de primitivas accesibles no reemplaza la validación de etiquetas, navegación por teclado, foco, contraste y mensajes de error en cada flujo.
