# Documentación técnica del frontend

**Última revisión:** 19 de noviembre de 2026
**Alcance:** TASK-171 — Actualización de Documentación Técnica y Diagramas UML Finales

## Índice

- [Arquitectura del frontend](guides/frontend-architecture.md): estructura,
  dependencias, seguridad de sesión, panel, Analítica, diagramas y despliegue.
- [Crear una nueva feature](guides/create-new-feature.md): recorrido de implementación.
- [Guía de estilo](guides/style-guide.md): convenciones de código.
- [Integración con el dashboard de Analítica](integrations/analytics-dashboard.md):
  cronología, flujo autenticado, cambios frontend, incidentes y validación.
- [ADR-F001](adr/ADR-F001-react-core.md): React 18.
- [ADR-F002](adr/ADR-F002-vite-build-tool.md): Vite.
- [ADR-F003](adr/ADR-F003-tailwind-shadcn.md): Tailwind y shadcn/ui.
- [ADR-F004](adr/ADR-F004-feature-driven-architecture.md): arquitectura por features.

## Diagramas

Los diagramas propios del cliente están en
`guides/frontend-architecture.md`: contenedores lógicos, dependencias entre
features, flujo de sesión y secuencia de Analítica. Los diagramas integrales del
sistema —C4, secuencias, despliegue, casos de uso y ER— pertenecen al repositorio
backend, carpeta `login-federado/docs/diagrams/`, para evitar dos fuentes de
verdad.

## Límites documentados

- Los tokens se mantienen en memoria y nunca se persisten en storage del navegador.
- TanStack Query administra estado remoto; Zustand se limita a la sesión.
- La autorización visual no reemplaza la autorización del backend.
- Analítica se consume únicamente mediante el proxy del backend de Login.
- El smoke test del contenedor verifica HTML/Nginx, no un login end-to-end.
- `package-lock.json` continúa fuera del repositorio y se declara como limitación
  de reproducibilidad.
