import {createRouter, createWebHistory} from 'vue-router';

import dashboardRoutes from '../views/modules/dashboard/router.js';
import cuentasRoutes from '../views/modules/cuentas/router.js';
import inversionesRoutes from '../views/modules/inversiones/router.js';
import reportesRoutes from '../views/modules/reportes/router.js';
import transaccionesRoutes from '../views/modules/transacciones/router.js';
import loginRoutes from '../views/modules/login/router.js';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...dashboardRoutes,
        ...transaccionesRoutes,
        ...cuentasRoutes,
        ...inversionesRoutes,
        ...reportesRoutes,
        ...loginRoutes
    ]
});

export default router;