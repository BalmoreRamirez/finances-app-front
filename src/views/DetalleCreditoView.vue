<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useFinanceStore} from '../stores/financeStore';
import {storeToRefs} from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import {useConfirm} from 'primevue/useconfirm';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const store = useFinanceStore();
const creditoId = Number(route.params.id);
const {inversiones, pagos: todosLosPagos} = storeToRefs(store);
const {addPago, deletePago} = store;
// Estado para el modal de pago
const dialogPago = ref(false);
const nuevoPago = ref({
  id: null,
  fecha: new Date(),
  monto: 0,
  descripcion: 'Pago de cuota'
});

// Encontramos el crédito específico
const credito = computed(() => inversiones.value.find(inv => inv.id === creditoId));

// Usamos el getter para filtrar los pagos de este crédito
const pagos = computed(() => store.pagosPorCreditoId(creditoId));

// Cálculos
const totalPagado = computed(() => {
  return pagos.value.reduce((sum, pago) => sum + pago.monto, 0);
});

const saldoPendiente = computed(() => {
  return credito.value.montoTotal - totalPagado.value;
});

const porcentajePagado = computed(() => {
  return (totalPagado.value / credito.value.montoTotal) * 100;
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

// Cargar datos del crédito
onMounted(() => {
  // Aquí iría una llamada a la API para cargar los datos del crédito
  // Por ahora usamos datos de ejemplo
});

// Funciones
const abrirDialogPago = () => {
  nuevoPago.value = {
    id: null,
    fecha: new Date(),
    monto: saldoPendiente.value > 0 ? saldoPendiente.value : 0,
    descripcion: 'Pago de cuota'
  };
  dialogPago.value = true;
};

const guardarPago = () => {
  // Validación básica
  if (!nuevoPago.value.monto || nuevoPago.value.monto <= 0) {
    alert('Por favor ingresa un monto válido');
    return;
  }

  // Añadir el nuevo pago
  const pagoGuardado = {
    id: Date.now(),
    fecha: nuevoPago.value.fecha instanceof Date
        ? nuevoPago.value.fecha.toISOString().slice(0, 10)
        : nuevoPago.value.fecha,
    monto: nuevoPago.value.monto,
    descripcion: nuevoPago.value.descripcion
  };

  pagos.value.push(pagoGuardado);

  // Actualizar estado del crédito si se completó el pago
  if (saldoPendiente.value <= 0) {
    credito.value.estado = 'pagada';
  }

  dialogPago.value = false;
};

const handleDeletePago = (id) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar este registro de pago?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deletePago(pagoId);
    }
  });
};

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'activa':
      return 'bg-blue-100 text-blue-800';
    case 'pagada':
      return 'bg-green-100 text-green-800';
    case 'vencida':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const volver = () => {
  router.push('/inversiones');
};
</script>

<template>
  <div class="space-y-6">
    <ConfirmDialog/>

    <!-- Cabecera -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Detalle del Crédito</h1>
      <Button icon="pi pi-arrow-left" label="Volver" @click="volver" outlined/>
    </div>

    <!-- Datos del crédito -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-xl font-semibold mb-4">Información del Crédito</h2>
          <div class="space-y-3">
            <div>
              <span class="text-sm text-gray-500">Descripción:</span>
              <p class="text-gray-800 font-medium">{{ credito.descripcion }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Beneficiario:</span>
              <p class="text-gray-800 font-medium">{{ credito.beneficiario }}</p>
            </div>
            <div class="flex gap-4">
              <div>
                <span class="text-sm text-gray-500">Teléfono:</span>
                <p class="text-gray-800">{{ credito.telefono }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Email:</span>
                <p class="text-gray-800">{{ credito.email }}</p>
              </div>
            </div>
            <div>
              <span class="text-sm text-gray-500">Dirección:</span>
              <p class="text-gray-800">{{ credito.direccion }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Notas:</span>
              <p class="text-gray-700 italic">{{ credito.notas }}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Términos del Crédito</h2>
          <div class="space-y-3">
            <div class="flex gap-4">
              <div>
                <span class="text-sm text-gray-500">Monto prestado:</span>
                <p class="text-gray-800 font-medium">{{ formatCurrency(credito.montoInvertido) }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Interés:</span>
                <p class="text-gray-800 font-medium">{{ credito.interes }}%</p>
              </div>
            </div>
            <div>
              <span class="text-sm text-gray-500">Monto total a pagar:</span>
              <p class="text-gray-800 font-medium">{{ formatCurrency(credito.montoTotal) }}</p>
            </div>
            <div class="flex gap-4">
              <div>
                <span class="text-sm text-gray-500">Fecha del préstamo:</span>
                <p class="text-gray-800">{{ credito.fechaInversion }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Fecha de vencimiento:</span>
                <p class="text-gray-800">{{ credito.fechaVencimiento }}</p>
              </div>
            </div>
            <div>
              <span class="text-sm text-gray-500">Plazo:</span>
              <p class="text-gray-800">{{ credito.plazo }}</p>
            </div>
            <div>
              <span class="text-sm text-gray-500">Estado:</span>
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getEstadoClass(credito.estado)">
                {{ credito.estado.charAt(0).toUpperCase() + credito.estado.slice(1) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de cuenta -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Estado de Cuenta</h2>
        <Button label="Registrar Pago" icon="pi pi-plus" severity="success" @click="abrirDialogPago"/>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p class="text-sm text-gray-500">Total a pagar</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(credito.montoTotal) }}</p>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p class="text-sm text-gray-500">Pagado hasta ahora</p>
          <p class="text-xl font-bold text-green-600">{{ formatCurrency(totalPagado) }}</p>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p class="text-sm text-gray-500">Saldo pendiente</p>
          <p class="text-xl font-bold text-blue-600">{{ formatCurrency(saldoPendiente) }}</p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mb-6">
        <div class="flex justify-between text-sm mb-1">
          <span>Progreso de pago</span>
          <span>{{ Math.round(porcentajePagado) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-green-600 h-2.5 rounded-full" :style="`width: ${porcentajePagado}%`"></div>
        </div>
      </div>

      <!-- Historial de pagos -->
      <h3 class="text-lg font-medium mb-3">Historial de pagos</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="pago in pagos" :key="pago.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ pago.fecha }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ pago.descripcion }}</td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-green-600">{{ formatCurrency(pago.monto) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <Button icon="pi pi-trash" severity="danger" text @click="handleDeletePago(pago.id)"/>
            </td>
          </tr>
          <tr v-if="pagos.length === 0">
            <td colspan="4" class="px-6 py-4 text-sm text-gray-500 text-center">No hay pagos registrados</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de registro de pago -->
    <Dialog v-model:visible="dialogPago" modal header="Registrar Pago" :style="{ width: '450px' }">
      <div class="p-fluid">
        <div class="field mb-4">
          <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
          <Calendar id="fecha" v-model="nuevoPago.fecha" dateFormat="yy-mm-dd" class="w-full"/>
        </div>

        <div class="field mb-4">
          <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto del pago</label>
          <InputNumber id="monto" v-model="nuevoPago.monto" mode="currency" currency="MXN" locale="es-MX"/>
        </div>

        <div class="field mb-4">
          <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <InputText id="descripcion" v-model="nuevoPago.descripcion" class="w-full"/>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="dialogPago = false" text/>
        <Button label="Guardar" icon="pi pi-check" @click="guardarPago" severity="success"/>
      </template>
    </Dialog>
  </div>
</template>