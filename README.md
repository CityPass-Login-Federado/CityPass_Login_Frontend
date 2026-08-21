## To do:
- [ ] Servicio OAuth2 para el bus (bloqueante para otros grupos)
- [ ] Capa 2 de IA — Isolation Forest para detección de anomalías (diseño listo, sin código) --> geoip2
- [ ] Tests (0% cobertura, rúbrica pide 60%)
- [ ] CI/CD con GitHub Actions
- [ ] Revisar/decidir el destino del EventPublisher
- [ ] ADR formal (es un único ADR)
      Estructura deseada: titulo, quienes, consideradores extensible, opciones, por todo esto nosotros definimos, consecuencias positivas negativas, referencias (benchmark)
- [ ] Diagramas C4/4+1
- [ ] Deploy a cloud
- [ ] GET /auth/me
- [ ] Cambio/recuperación de contraseña (a definir)
- [ ] Publicación real de eventos al bus (Kafka)
- [ ] Pasar las claves a secrets, no ENV de dockerfile


# 🏙️ CityPass+ | Módulo 2: Login Federado</h1>
  <p><strong>Plataforma de Servicios Urbanos Inteligentes</strong></p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-3.x-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-3.x-blue.svg)](https://react.dev/)
  [![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
  [![UADE](https://img.shields.io/badge/UADE-DesApp_II-004d99.svg)]()

---

## 📖 Descripción del Módulo
El **Módulo de Login Federado (LDAP + JWT)** es el núcleo de seguridad y gestión de identidad de la plataforma **CityPass+**. Centraliza la autenticación de todos los usuarios de la ciudad inteligente, interactuando con un directorio de identidades corporativo (OpenLDAP) y emitiendo tokens de acceso seguros (JWT con firma asimétrica RS256) para proteger todos los endpoints de los 7 módulos restantes.

Este proyecto forma parte de la asignatura **Desarrollo de Aplicaciones II (2c 2026)**, dictada por el profesor Andrés Sacco en la Universidad Argentina de la Empresa (UADE).

---

## 👥 Equipo de Trabajo (Grupo 2)

| Integrante | Rol | Módulo |
| :--- | :--- | :--- |
| **Abeledo, Federico** | Project Manager (PM) | Login Federado |
| **Francisco Frate, Delfina** | Scrum Master | Login Federado |
| **Hernandez, Nicolas** | Backend | Login Federado |
| **Opatich, Ignacio** | Frontend | Login Federado |
| **Ravaschio, Guido** | DevOps | Login Federado |
| **Wu, Antonio** | Security / Backend | Login Federado |

---

## 🏗️ Alineación con la Rúbrica (Evaluación)

Nuestro desarrollo está diseñado para cumplir con los estándares técnicos exigidos en la materia:

- 📐 **Arquitectura y Modelado:** Documentación de decisiones (ADRs), diagramas C4 y modelo Entidad-Relación.
- 🔐 **Seguridad Avanzada:** Autenticación LDAP, tokens de sesión JWT firmados asimétricamente (RS256) y validación de claims.
- 📨 **Event Driven Architecture (EDA):** Publicación y suscripción a eventos de auditoría/seguridad mediante bus de mensajes (RabbitMQ/Kafka).
- 🧪 **Testing Integrado:** Pruebas unitarias e integrales con JUnit 5, Mockito y Testcontainers apuntando a >60% de cobertura.
- 🚀 **DevOps & Cloud:** Entorno local 100% dockerizado (`docker-compose`), flujos CI/CD con GitHub Actions y despliegue cloud.
- 🧠 **Innovación (IA/I+D):** Lógica avanzada de detección de anomalías y prevención de fuerza bruta en los intentos de inicio de sesión.
- 📱 **UX/UI:** Interfaz Frontend desarrollada en React orientada a una experiencia de autenticación fluida.
- 🔄 **Gestión Ágil:** Framework Scrum, seguimiento con Jira y control de versiones bajo políticas de Git Flow.

---

## 🛠️ Stack Tecnológico

* **Backend:** Java 21, Spring Boot 3, Spring Security 6.
* **Directorio de Identidad:** OpenLDAP.
* **Base de Datos:** PostgreSQL.
* **Firma Asimétrica:** JWT (Algoritmo RS256).
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS.
* **Testing:** JUnit 5, Mockito, Testcontainers.
* **Infraestructura:** Docker, Docker Compose, GitHub Actions.

---

## 🚀 Inicio Rápido (Local Setup)
