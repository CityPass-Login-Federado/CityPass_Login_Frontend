# ADR-009: Vite como Entorno de Desarrollo y Empaquetado

## Estado: Aceptado

## Contexto
Necesitamos una herramienta para compilar nuestra aplicación React con TypeScript, optimizar los recursos estáticos (imágenes, CSS) y generar el *bundle* final de producción que será servido por un contenedor Docker (Nginx) para el despliegue cloud.

## Opciones consideradas

### Opción A: Create React App (Webpack)
| Pros | Contras |
|------|---------|
| Estándar histórico de la comunidad | Deprecado oficialmente por el equipo de React |
| Cero configuración inicial | Tiempos de recarga en frío (HMR) muy lentos |

### Opción B: Next.js (Server-Side Rendering)
| Pros | Contras |
|------|---------|
| Excelente SEO y rendimiento | Sobreingeniería para un portal de login interno |
| Ecosistema robusto | Requiere un servidor Node.js corriendo (mayor consumo de recursos cloud) |

### Opción C: Vite (Elegida)
| Pros | Contras |
|------|---------|
| Compilación y HMR casi instantáneos (basado en esbuild) | Ecosistema más nuevo (menor cantidad de plugins antiguos compatibles) |
| Genera archivos estáticos puros (HTML/JS/CSS) | |
| Configuración mínima para TypeScript | |

## Decisión
**Opción C: Vite**
Elegimos Vite porque nos permite exportar una SPA completamente estática. Esto es crítico para la dimensión de "DevOps & Cloud"[cite: 3], ya que nos permite usar un contenedor de Nginx ultraligero que consumirá muy poca memoria en los tiers gratuitos de los proveedores cloud. Además, la velocidad de desarrollo local (HMR) agiliza drásticamente el trabajo del Frontend.

## Consecuencias
- El entorno local levantará en milisegundos.
- El `Dockerfile` del frontend tendrá un stage de compilación (`npm run build`) y un stage de ejecución con `nginx:alpine`.