import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import {createPinia} from "pinia";
import App from './App.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import ToastService from "primevue/toastservice";
import ConfirmationService from 'primevue/confirmationservice';
import Tailwind from 'primevue/passthrough/tailwind';
import 'primeicons/primeicons.css';

import Toast from "primevue/toast";
import router from './router';

import './style.css';
import 'primevue/resources/themes/lara-light-teal/theme.css';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(ConfirmationService);
app.component('ConfirmDialog', ConfirmDialog);
app.use(ToastService);
app.component('Toast', Toast);
app.use(PrimeVue, {
    unstyled: false,
    pt: Tailwind
});
app.mount('#app');