# Finance App - Gestor de Finanzas Personales

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=for-the-badge&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-2-FFD859?style=for-the-badge&logo=pinia)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss)
![PrimeVue](https://img.shields.io/badge/PrimeVue-3-4CAF50?style=for-the-badge&logo=prime)

Una aplicación web moderna construida con Vue 3 y Vite para la gestión de finanzas personales, incluyendo el seguimiento
de cuentas, inversiones y créditos.

## Descripción del Proyecto

**Finance App** es una herramienta intuitiva diseñada para ayudar a los usuarios a tener un control claro y detallado de
sus finanzas. Permite registrar diferentes tipos de cuentas de dinero, administrar inversiones como compra-venta de
activos o créditos otorgados a terceros, y visualizar resúmenes financieros clave para una mejor toma de decisiones.

## Características Principales

- **Gestión de Cuentas**: Administra múltiples cuentas (ej. efectivo, banco) y sus saldos.
- **Seguimiento de Inversiones**:
    - Registra inversiones de tipo **Compra-Venta** (activos).
    - Registra y administra **Créditos** otorgados, incluyendo cálculo de intereses, cuotas y fechas de vencimiento.
- **Dashboard Financiero**: Visualiza métricas importantes como el balance general, total invertido, ganancias totales e
  inversiones activas.
- **Operaciones CRUD**: Funcionalidad completa para crear, leer, actualizar y eliminar (CRUD) las inversiones.
- **Interfaz Reactiva y Moderna**: Desarrollada con Vue 3 y el Composition API (`<script setup>`).
- **Componentes de UI Profesionales**: Uso de PrimeVue para componentes robustos como tablas, modales, dropdowns y
  calendarios.
- **Estilos Personalizables**: Interfaz estilizada con Tailwind CSS para un diseño limpio y responsivo.
- **Gestión de Estado Centralizada**: Manejo del estado de la aplicación con Pinia, garantizando un flujo de datos
  predecible y persistente.

## Stack Tecnológico

- **Framework Frontend**: [Vue 3](https://vuejs.org/)
- **Entorno de Desarrollo**: [Vite](https://vitejs.dev/)
- **Gestión de Estado**: [Pinia](https://pinia.vuejs.org/)
- **Framework de UI**: [Tailwind CSS](https://tailwindcss.com/)
- **Librería de Componentes**: [PrimeVue](https://primevue.org/)
- **Enrutamiento**: [Vue Router](https://router.vuejs.org/)

## Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18.x o superior recomendada)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:BalmoreRamirez/finance-app.git
   cd finance-app
   ```

2. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar los siguientes comandos:

- `npm run dev`: Inicia la aplicación en modo de desarrollo con Hot-Reload.
- `npm run build`: Compila la aplicación para producción en el directorio `dist/`.
- `npm run preview`: Sirve localmente el build de producción para previsualización.

## Estructura del Proyecto

El código fuente se organiza de la siguiente manera para mantener la modularidad y escalabilidad:
src/
├── assets/ # Archivos estáticos como CSS e imágenes
├── components/ # Componentes de Vue reutilizables (ej. modales, botones)
├── router/ # Configuración de Vue Router
├── stores/ # Módulos de estado de Pinia (ej. financeStore.js)
├── views/ # Componentes de página (asociados a las rutas)
├── App.vue # Componente raíz de la aplicación
└── main.js # Punto de entrada de la aplicación

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar el proyecto, por favor sigue estos pasos:

1. Haz un Fork del proyecto.
2. Crea una nueva rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`).
3. Realiza tus cambios y haz commit (`git commit -m 'Add some AmazingFeature'`).
4. Empuja tus cambios a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

## Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
