# ADR-F001: React 18 como librería principal de interfaz de usuario

## Estado: Aceptado

## Contexto
El módulo de Login Federado es la puerta de entrada a la plataforma CityPass+. El frontend debe resolver los flujos de autenticación y recuperación de contraseña, además de las pantallas protegidas para la gestión de usuarios y grupos.

Necesitamos una Single Page Application (SPA) mantenible, con una experiencia de usuario fluida y un ecosistema que permita integrar enrutamiento, consumo de APIs, estado cliente y estado de servidor.

## Opciones consideradas

### Opción A: Angular 18
| Pros | Contras |
|------|---------|
| Ecosistema completo ("baterías incluidas") | Curva de aprendizaje empinada para el equipo |
| Fuerte integración con POO (similar a Java Spring Boot) | Alto nivel de *boilerplate* inicial |
| Excelente manejo HTTP con RxJS | Mayor peso inicial del *bundle* (Time-to-Interactive más lento) |

### Opción B: React 18 (Elegida)
| Pros | Contras |
|------|---------|
| Arquitectura funcional y flexible (Hooks) | Requiere elegir librerías de terceros (enrutamiento, peticiones) |
| Curva de aprendizaje más rápida para llegar al MVP | No opina sobre la arquitectura de carpetas |
| Permite incorporar solamente las dependencias necesarias para la aplicación | La integración entre esas dependencias queda bajo responsabilidad del equipo |
| Ecosistema amplio y buen soporte para pruebas de componentes | |

## Decisión
**Opción B: React 18**

Elegimos React por su modelo de componentes funcionales, su ecosistema y la experiencia previa del equipo. La flexibilidad de la librería permite construir tanto los flujos públicos de autenticación como el panel protegido sin incorporar las capacidades de un framework de renderizado del lado del servidor que esta aplicación no necesita.

## Consecuencias
- La interfaz se implementa con componentes funcionales y Hooks.
- El enrutamiento del lado del cliente se resuelve con React Router.
- Axios se utiliza como cliente HTTP, TanStack Query para el estado de servidor y Zustand para el estado compartido de la sesión.
- Las actualizaciones mayores de React y de las librerías que integran su ecosistema deben evaluarse explícitamente para evitar incompatibilidades.
