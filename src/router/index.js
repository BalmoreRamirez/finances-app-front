import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ReportesView from '../views/ReportesView.vue';
import IngresosView from '../views/IngresosView.vue'; // Importar
import GastosView from '../views/GastosView.vue';
import InversionesView from '../views/InversionesView.vue';
import DetalleCreditoView from '../views/DetalleCreditoView.vue';
import CuentasView from "../views/CuentasView.vue";

// Componente de marcador de posición para las rutas no creadas
const Placeholder = (text) => ({template: `<div class="text-2xl font-bold">${text}</div>`});

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', name: 'dashboard', component: HomeView},
        {path: '/reportes', name: 'reportes', component: ReportesView},
        {path: '/ingresos', name: 'ingresos', component: IngresosView},
        {path: '/gastos', name: 'gastos', component: GastosView},
        {path: '/cuentas', name: 'cuentas', component: CuentasView},
        {path: '/inversiones', name: 'inversiones', component: InversionesView},
        {path: '/creditos/:id', name: 'detalle-credito', component: DetalleCreditoView},
        {path: '/ajustes', name: 'ajustes', component: Placeholder('Configuración')}
    ]
});

export default router;