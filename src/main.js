import {createApp} from 'vue';
import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';

// Importaciones lazy de PrimeVue
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from "primevue/toastservice";
import Tailwind from 'primevue/passthrough/tailwind';

// CSS crítico
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/lara-light-teal/theme.css';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

// Configurar persistencia de estado
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.directive('tooltip', Tooltip);
app.use(ToastService);
app.use(ConfirmationService);
app.use(PrimeVue, {
    unstyled: false,
    ripple: true,
    pt: Tailwind
});

// Cargar componentes globales (simplificado para evitar problemas)
const components = import.meta.glob('./components/**/*.vue', { eager: true });
Object.entries(components).forEach(([path, definition]) => {
    const componentName = path.split('/').pop().replace(/\.\w+$/, '');
    app.component(componentName.replace('Component', ''), definition.default);
});

app.mount('#app');