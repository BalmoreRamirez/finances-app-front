import {createApp} from 'vue';
import {createPinia} from "pinia";
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Tailwind from 'primevue/passthrough/tailwind';

import 'primeicons/primeicons.css';
import 'primevue/resources/themes/lara-light-teal/theme.css';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);
app.use(PrimeVue, {
    unstyled: false,
    pt: Tailwind
});
app.mount('#app');