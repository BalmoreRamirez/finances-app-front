import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ReportesView from '../views/ReportesView.vue';
import IngresosView from '../views/IngresosView.vue'; // Importar
import GastosView from '../views/GastosView.vue';   // Importar

// Componente de marcador de posición para las rutas no creadas
const Placeholder = (text) => ({ template: `<div class="text-2xl font-bold">${text}</div>` });

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: HomeView },
    { path: '/reportes', name: 'reportes', component: ReportesView },
    { path: '/ingresos', name: 'ingresos', component: IngresosView }, // Usar componente
    { path: '/gastos', name: 'gastos', component: GastosView },     // Usar componente
    { path: '/ajustes', name: 'ajustes', component: Placeholder('Configuración') }
  ]
});

export default router;