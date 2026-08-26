# ADR-008: React 18 como Librería Core de Interfaz de Usuario

## Estado: Aceptado

## Contexto
El módulo de Login Federado es la puerta de entrada a la plataforma CityPass+ y protegerá todos los endpoints del sistema. Necesitamos desarrollar una Single Page Application (SPA) que sea rápida, ligera y que nos permita alcanzar un MVP funcional para las entregas de los Sprints 1 y 2.

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
| Bundle inicial muy ligero (ideal para un portal de login) | |
| Excelente compatibilidad futura para Micro-Frontends | |

## Decisión
**Opción B: React 18**
Elegimos React porque priorizamos la velocidad de carga inicial y la agilidad de desarrollo. Al tener un cuatrimestre con tiempos limitados, React minimiza la fricción arquitectónica inicial y nos asegura tener el MVP funcional en las primeras entregas del proyecto. Además, su menor peso asegura que los ciudadanos accedan al login casi instantáneamente.

## Consecuencias
- Utilizaremos componentes funcionales y Hooks.
- Debemos seleccionar y configurar librerías adicionales para el cliente HTTP (Axios) y el estado (Zustand/React Query).