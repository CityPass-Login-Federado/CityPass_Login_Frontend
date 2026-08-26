## To do (Sprint 0 - Sprint 2):
- [x] Definir stack tecnológico Frontend (ADRs F001 al F004 documentados)
- [x] Inicializar estructura de carpetas base (Feature-Driven)
- [ ] Configurar Vite + React + TypeScript + Tailwind CSS
- [ ] Integrar Shadcn UI y componentes base
- [ ] Generar cliente HTTP (Axios) sincronizado con el OpenAPI/Swagger del Backend
- [ ] Implementar interceptores HTTP para inyectar Access Token y manejar errores 401
- [ ] Lógica de rotación transparente del Refresh Token
- [ ] Maquetar pantalla de Login (cumpliendo 10 pts de UX/UI)
- [ ] Tests de componentes con Vitest + RTL (0% cobertura actual, rúbrica pide 60%)
- [ ] Dockerizar SPA con Nginx (Dockerfile multi-stage)
- [ ] CI/CD con GitHub Actions (Build & Test)
- [ ] Deploy a cloud (Render / Vercel / Azure)

# 🏙️ CityPass+ | Módulo 2: Login Federado (Frontend)
<p><strong>Plataforma de Servicios Urbanos Inteligentes</strong></p>

[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)]()
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite&logoColor=white)]()
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4.svg?logo=tailwind-css&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED.svg?logo=docker&logoColor=white)]()
[![UADE](https://img.shields.io/badge/UADE-DesApp_II-004d99.svg)]()
[![Figma](https://img.shields.io/badge/Figma-Prototipo-F24E1E.svg?logo=figma&logoColor=white)](https://www.figma.com/design/m2LnV4pIoZDh4wD1dfWCyU/Login---Dapis-2?node-id=3-2&t=HCMyf8hR4Mjeap7I-1)

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

## 🏗️ Arquitectura y Rúbrica
Para cumplir con los 10 puntos de la dimensión "Diseño de Arquitectura", el frontend utiliza una **Arquitectura Feature-Driven (Orientada a Funcionalidades)**. El código se agrupa por dominio de negocio dentro de `src/features/` (ej. `auth`, `roles`, `audit`), garantizando alta cohesión y bajo acoplamiento.

Nuestro desarrollo está diseñado para sumar en las siguientes dimensiones exigidas por la cátedra:
- 🎨 **UX/UI (10 pts):** Interfaz responsiva, accesible y moderna desarrollada con Tailwind CSS + Shadcn UI.
- 🔌 **Integración y APIs (10 pts):** Consumo estricto y tipado del contrato REST expuesto por el backend, con manejo centralizado de errores HTTP.
- 🔐 **Seguridad Avanzada (10 pts):** Gestión segura del ciclo de vida del JWT, interceptores e invalidación de sesión mediante *Refresh Tokens*.
- 🧪 **Testing Integrado (10 pts):** Pruebas de renderizado y lógica de componentes con Vitest y React Testing Library, apuntando a >60% de cobertura.
- 🚀 **DevOps & Cloud (10 pts):** Entorno empaquetado mediante un `Dockerfile` multi-stage ligero (sirviendo estáticos con Nginx), validado en CI/CD y listo para despliegue cloud.

---

## 🛠️ Stack Tecnológico

* **Librería Core:** React 18+
* **Entorno & Build Tool:** Vite + TypeScript
* **Estilos y UI:** Tailwind CSS + Shadcn UI
* **Cliente HTTP & Estado:** Axios + TanStack Query (React Query) + Zustand
* **Testing:** Vitest + React Testing Library
* **Infraestructura:** Docker (Nginx), GitHub Actions

---

## 📚 Documentación Interna
- **ADRs (Architecture Decision Records):** En la carpeta `docs/adr/` se encuentran justificadas todas las decisiones tecnológicas del frontend (React, Vite, Tailwind, Feature-Driven), tal como exige la consideración final del proyecto.
- **Guías de Desarrollo:** En `docs/guides/create-new-feature.md` se detalla el paso a paso estándar para que cualquier integrante pueda maquetar nuevas funcionalidades respetando la arquitectura.

---

## 🚀 Inicio Rápido (Local Setup)

Para levantar el entorno de desarrollo en tu máquina local, asegúrate de tener instalado **Node.js (v20+)** y **npm**.

### 1. Clonar e instalar dependencias
En la raíz del proyecto frontend, ejecuta:
```bash
npm install