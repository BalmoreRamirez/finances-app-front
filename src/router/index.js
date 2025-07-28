import {createRouter, createWebHistory} from 'vue-router';
import MainLayout from "../views/layouts/MainLayout.vue";
import dashboardRoutes from '../views/modules/dashboard/router.js';
import cuentasRoutes from '../views/modules/cuentas/router.js';
import investmentRoutes from '../views/modules/investments/router.js';
import reportesRoutes from '../views/modules/reportes/router.js';
import transaccionesRoutes from '../views/modules/transacciones/router.js';
import loginRoutes from '../views/modules/login/router.js';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...loginRoutes, {
            path: '/',
            component: MainLayout,
            redirect: '/dashboard',
            children: [
                ...dashboardRoutes,
                ...transaccionesRoutes,
                ...cuentasRoutes,
                ...investmentRoutes,
                ...reportesRoutes
            ]
        }


    ]
});

export default router;