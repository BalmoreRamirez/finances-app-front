export default [
    {
        path: '/inversiones',
        name: 'inversiones',
        component: () => import('./views/InversionesView.vue'),
    },
    {
        path: '/inversiones/detalle/:id',
        name: 'detalle-credito',
        component: () => import('./views/DetalleCreditoView.vue')
    }
];