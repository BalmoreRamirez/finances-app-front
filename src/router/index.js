import {createRouter, createWebHistory} from 'vue-router';

// Lazy loading para el layout principal
const MainLayout = () => import("../views/layouts/MainLayout.vue");

// Lazy loading para los módulos de rutas
const dashboardRoutes = () => import('../views/modules/dashboard/router.js');
const cuentasRoutes = () => import('../views/modules/cuentas/router.js');
const investmentRoutes = () => import('../views/modules/investments/router.js');
const reportesRoutes = () => import('../views/modules/reportes/router.js');
const transaccionesRoutes = () => import('../views/modules/transacciones/router.js');
const loginRoutes = () => import('../views/modules/login/router.js');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/modules/login/LoginView.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/',
            component: MainLayout,
            redirect: '/dashboard',
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('../views/modules/dashboard/views/DashboardView.vue')
                },
                {
                    path: 'transacciones',
                    name: 'transacciones',
                    component: () => import('../views/modules/transacciones/views/TransaccionesView.vue')
                },
                {
                    path: 'cuentas',
                    name: 'cuentas', 
                    component: () => import('../views/modules/cuentas/views/CuentasView.vue')
                },
                {
                    path: 'inversiones',
                    name: 'inversiones',
                    component: () => import('../views/modules/investments/views/InvestMentsView.vue')
                },
                {
                    path: 'detalle-credito/:id',
                    name: 'detalle-credito',
                    component: () => import('../views/modules/investments/views/DetalleCreditoView.vue')
                },
                {
                    path: 'reportes',
                    name: 'reportes',
                    component: () => import('../views/modules/reportes/views/ReportesView.vue')
                }
            ]
        }
    ]
});

// Guard de navegación para autenticación
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('accessToken');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    
    if (requiresAuth && !token) {
        next('/login');
    } else if (to.path === '/login' && token) {
        next('/dashboard');
    } else {
        next();
    }
});

export default router;