<script setup>
import {ref, computed} from 'vue';
import {useFinanceStore} from '../stores/financeStore.js';
import {storeToRefs} from 'pinia';
// CORRECCIÓN 1: Ruta de importación ajustada
import InversionModal from '../components/InversionModal.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import {useConfirm} from "primevue/useconfirm";
import Dropdown from 'primevue/dropdown';
import {useRouter} from 'vue-router';

const router = useRouter();
const confirm = useConfirm();
const store = useFinanceStore();
const {inversiones, cuentas} = storeToRefs(store);
const {deleteInversion, addInversion, updateInversion} = store;

const showModal = ref(false);
const isEditMode = ref(false);
const inversionToEdit = ref(null);
const filtroTipo = ref('todos');

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

const tiposFiltro = ref([
  {label: 'Todas', value: 'todos'},
  {label: 'Compra-Venta', value: 'compraventa'},
  {label: 'Créditos', value: 'credito'}
]);

const inversionesFiltradas = computed(() => {
  if (filtroTipo.value === 'todos') {
    return inversiones.value;
  }
  return inversiones.value.filter(inv => inv.tipo === filtroTipo.value);
});

// Estadísticas
const totalInvertido = computed(() => {
  return inversiones.value.reduce((sum, inv) => sum + inv.montoInvertido, 0);
});

const totalGanancias = computed(() => store.totalGanancias);

const inversionesActivas = computed(() => {
  return inversiones.value.filter(inv => inv.estado === 'activa');
});

const totalInversionesActivas = computed(() => store.totalInvertidoActivo);

// CORRECCIÓN 2: Inicializar con un objeto por defecto en lugar de null
const openCreateModal = () => {
  isEditMode.value = false;
  inversionToEdit.value = {
    id: null,
    cuentaId: null,
    tipo: 'credito',
    descripcion: '',
    beneficiario: '',
    montoInvertido: 0,
    interes: 0,
    montoTotal: 0,
    ganancia: 0,
    fechaInversion: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    estado: 'activa'
  };
  showModal.value = true;
};

const openEditModal = (inversion) => {
  isEditMode.value = true;
  inversionToEdit.value = {...inversion};
  showModal.value = true;
};

const handleDeleteInversion = (id) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar esta inversión?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteInversion(id);
    },
  });
};

const handleSaveInversion = (inversionData) => {
  if (inversionData.id) {
    updateInversion(inversionData);
  } else {
    addInversion(inversionData);
  }
  showModal.value = false;
};

const getEstadoClass = (estado) => {
  switch (estado) {
    case 'activa':
      return 'bg-blue-100 text-blue-800';
    case 'finalizada':
      return 'bg-green-100 text-green-800';
    case 'pagada':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getEstadoText = (estado) => {
  switch (estado) {
    case 'activa':
      return 'Activa';
    case 'finalizada':
      return 'Finalizada';
    case 'pagada':
      return 'Pagada';
    default:
      return estado;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Componente de confirmación -->
    <ConfirmDialog/>

    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Inversiones</h1>
        <p class="text-gray-500 mt-1">Administra tus inversiones y créditos otorgados.</p>
      </div>
      <button @click="openCreateModal"
              class="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors">
        <span class="material-icons">add_circle_outline</span>
        <span>Registrar Inversión</span>
      </button>
    </div>

    <!-- Resumen estadístico -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <div class="flex items-center">
          <div class="rounded-full bg-blue-100 p-3">
            <span class="material-icons text-blue-600">account_balance</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Invertido</p>
            <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totalInvertido) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-md">
        <div class="flex items-center">
          <div class="rounded-full bg-green-100 p-3">
            <span class="material-icons text-green-600">trending_up</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Ganancias Totales</p>
            <p class="text-xl font-bold text-green-600">{{ formatCurrency(totalGanancias) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-md">
        <div class="flex items-center">
          <div class="rounded-full bg-amber-100 p-3">
            <span class="material-icons text-amber-600">schedule</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Inversiones Activas</p>
            <p class="text-xl font-bold text-gray-800">{{ inversionesActivas.length }}
              ({{ formatCurrency(totalInversionesActivas) }})</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex justify-end">
      <div class="w-72">
        <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por tipo:</label>
        <Dropdown v-model="filtroTipo" :options="tiposFiltro" optionLabel="label" optionValue="value" class="w-full"/>
      </div>
    </div>

    <!-- Tabla de Inversiones -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ganancia
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="inversion in inversionesFiltradas" :key="inversion.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              :class="inversion.tipo === 'compraventa' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'">
                          {{ inversion.tipo === 'compraventa' ? 'Compra-Venta' : 'Crédito' }}
                        </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ inversion.descripcion }}</div>
              <div v-if="inversion.tipo === 'credito'" class="text-xs text-gray-500">
                Beneficiario: {{ inversion.beneficiario }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ formatCurrency(inversion.montoInvertido) }}</div>
              <div v-if="inversion.tipo === 'credito'" class="text-xs text-gray-600">
                Total: {{ formatCurrency(inversion.montoTotal) }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="inversion.ganancia" class="text-sm text-green-600 font-semibold">
                {{ formatCurrency(inversion.ganancia) }}
              </div>
              <div v-else class="text-sm text-gray-500 italic">Pendiente</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">
                {{ inversion.tipo === 'credito' ? 'Préstamo:' : 'Inversión:' }} {{ inversion.fechaInversion }}
              </div>
              <div class="text-xs text-gray-500">
                <template v-if="inversion.tipo === 'credito'">
                  Vencimiento: {{ inversion.fechaVencimiento }}
                </template>
                <template v-else>
                  <span v-if="inversion.fechaRetorno">Retorno: {{ inversion.fechaRetorno }}</span>
                  <span v-else>Retorno: Pendiente</span>
                </template>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              :class="getEstadoClass(inversion.estado)">
                          {{ getEstadoText(inversion.estado) }}
                        </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <Button v-if="inversion.tipo === 'credito'"
                      icon="pi pi-list"
                      severity="success"
                      text
                      @click="router.push(`/creditos/${inversion.id}`)"
                      v-tooltip.top="'Ver detalle de cuotas'"
              />
              <Button icon="pi pi-pencil" severity="info" text @click="openEditModal(inversion)"/>
              <Button icon="pi pi-trash" severity="danger" text @click="handleDeleteInversion(inversion.id)"/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para agregar o editar inversión -->
    <InversionModal
        v-model:visible="showModal"
        :is-edit-mode="isEditMode"
        :inversion-data="inversionToEdit"
        @save="handleSaveInversion"
    />
  </div>
</template>