export default [
    {
        path: '/inversiones',
        name: 'inversiones',
        component: () => import('./views/InvestMentsView.vue'),
    },
    {
        path: '/inversiones/:id',
        name: 'detalle-credito',
        component: () => import('./views/DetalleCreditoView.vue')
    }
];