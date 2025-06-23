import {createRouter, createWebHistory} from 'vue-router';

// Importar rutas de cada módulo
import dashboardRoutes from '../views/modules/dashboard/router.js';
import ingresosRoutes from '../views/modules/ingresos/router.js';
import gastosRoutes from '../views/modules/gastos/router.js';
import cuentasRoutes from '../views/modules/cuentas/router.js';
import inversionesRoutes from '../views/modules/inversiones/router.js';
import reportesRoutes from '../views/modules/reportes/router.js';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...dashboardRoutes,
        ...ingresosRoutes,
        ...gastosRoutes,
        ...cuentasRoutes,
        ...inversionesRoutes,
        ...reportesRoutes,
    ]
});

export default router;