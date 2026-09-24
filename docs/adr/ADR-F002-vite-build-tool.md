# ADR-F002: Vite como entorno de desarrollo y empaquetado

## Estado: Aceptado

## Contexto
Necesitamos una herramienta para ejecutar y compilar la aplicación React con TypeScript, procesar sus recursos estáticos y generar un artefacto de producción que no requiera un servidor Node.js. La salida debe poder servirse mediante Nginx dentro de un contenedor y también desde una plataforma de alojamiento estático.

## Opciones consideradas

### Opción A: Create React App (Webpack)
| Pros | Contras |
|------|---------|
| Estándar histórico de la comunidad | Deprecado oficialmente por el equipo de React |
| Cero configuración inicial | Tiempos de recarga en frío (HMR) muy lentos |

### Opción B: Next.js (Server-Side Rendering)
| Pros | Contras |
|------|---------|
| Soporta renderizado estático y del lado del servidor | Incorpora convenciones y capacidades que esta SPA no necesita |
| Ecosistema robusto | El renderizado del lado del servidor agregaría complejidad operativa |

### Opción C: Vite (Elegida)
| Pros | Contras |
|------|---------|
| Servidor de desarrollo rápido y HMR eficiente | Algunas integraciones requieren configuración específica de Vite |
| Genera archivos estáticos puros (HTML/JS/CSS) | |
| Configuración mínima para TypeScript | |

## Decisión
**Opción C: Vite**

Elegimos Vite porque ofrece una experiencia de desarrollo rápida, integración directa con React y TypeScript, y una salida de producción compuesta por archivos estáticos. Esta salida permite desplegar la misma SPA detrás de Nginx o en una plataforma de alojamiento estático sin mantener un proceso Node.js en ejecución.

## Consecuencias
- El desarrollo local utiliza el servidor de Vite y un proxy `/api` hacia el backend.
- El `Dockerfile` utiliza una etapa de compilación con Node.js y una etapa de ejecución con Nginx como usuario no privilegiado.
- Nginx y Vercel deben redirigir las rutas desconocidas a `index.html` para permitir el enrutamiento del lado del cliente.
- El resultado de `npm run build` es el artefacto estático utilizado por los distintos destinos de despliegue.
