<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {storeToRefs} from 'pinia';
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useFinanceStore} from '../../../../stores/financeStore.js';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Dropdown from 'primevue/dropdown';
import InversionModal from '../components/InversionModal.vue';
import Tag from 'primevue/tag';
import Tooltip from 'primevue/tooltip';

// Inicialización
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const store = useFinanceStore();
const {deleteInversion, addInversion, updateInversion, fetchInvestments} = store;

// State reactivo del store
const {inversiones, totalGanancias, totalInvertidoActivo} = storeToRefs(store);

// State local del componente
const showModal = ref(false);
const isEditMode = ref(false);
const inversionToEdit = ref(null);
const filtroTipo = ref('todos');
const tiposFiltro = ref([
  {label: 'Todas', value: 'todos'},
  {label: 'Compra-Venta', value: 'compraventa'},
  {label: 'Créditos', value: 'credito'}
]);

onMounted(() => {
  fetchInvestments();
});

// Propiedades computadas
const inversionesFiltradas = computed(() => {
  if (filtroTipo.value === 'todos') {
    return inversiones.value;
  }
  return inversiones.value.filter(inv => inv.tipo === filtroTipo.value);
});

const totalInvertido = computed(() => {
  return inversiones.value.reduce((sum, inv) => sum + (inv.monto || 0), 0);
});

// Métodos
const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(0);
  }
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

const openCreateModal = () => {
  isEditMode.value = false;
  inversionToEdit.value = {
    id: null,
    cuentaId: null,
    tipo: 'credito', // Tipo por defecto
    descripcion: '',
    beneficiario: '',
    monto: 0,
    interes: 0,
    ganancia: 0,
    montoTotal: 0,
    // Campos para compra-venta con valores por defecto
    cantidad: 1,
    costoUnitario: 0,
    gananciaUnitaria: 0,
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

const handleSaveInversion = async (inversionData) => {
  // La lógica de cálculo ahora está completamente en el modal.
  // Este método solo se encarga de llamar a la acción del store.
  let success = false;
  const action = isEditMode.value ? 'actualizada' : 'creada';

  if (isEditMode.value) {
    success = await updateInversion(inversionData);
  } else {
    success = await addInversion(inversionData);
  }

  if (success) {
    toast.add({severity: 'success', summary: 'Éxito', detail: `Inversión ${action} correctamente.`, life: 3000});
  } else {
    toast.add({severity: 'error', summary: 'Error', detail: `No se pudo guardar la inversión.`, life: 3000});
  }

  showModal.value = false;
};

const handleDeleteInversion = (id) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar esta inversión? Esta acción no se puede deshacer.',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const success = await deleteInversion(id);
      if (success) {
        toast.add({severity: 'success', summary: 'Éxito', detail: 'Inversión eliminada.', life: 3000});
      } else {
        toast.add({severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la inversión.', life: 3000});
      }
    },
  });
};

const verDetalleCredito = (inversion) => {
  router.push({name: 'detalle-credito', params: {id: inversion.id}});
};

const getEstadoTag = (estado) => {
  switch (estado) {
    case 'activa':
      return {severity: 'info', text: 'Activa'};
    case 'pagada':
      return {severity: 'success', text: 'Pagada'};
    case 'finalizada':
      return {severity: 'success', text: 'Finalizada'};
    case 'vencida':
      return {severity: 'danger', text: 'Vencida'};
    default:
      return {severity: 'secondary', text: 'Otro'};
  }
};
</script>

<template>
  <div class="space-y-6">
    <ConfirmDialog/>

    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Inversiones</h1>
        <p class="text-gray-500 mt-1">Administra tus inversiones y créditos otorgados.</p>
      </div>
      <Button @click="openCreateModal" label="Registrar Inversión" icon="pi pi-plus" severity="success"/>
    </div>

    <!-- Resumen estadístico -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-blue-100 p-3 flex items-center justify-center">
          <i class="pi pi-wallet text-xl text-blue-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Total Invertido</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totalInvertido) }}</p>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-green-100 p-3 flex items-center justify-center">
          <i class="pi pi-chart-line text-xl text-green-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Ganancias Potenciales</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totalGanancias) }}</p>
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div class="rounded-full bg-amber-100 p-3 flex items-center justify-center">
          <i class="pi pi-bolt text-xl text-amber-600"></i>
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-500">Inversiones Activas</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totalInvertidoActivo) }}</p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex justify-end">
      <div class="w-full md:w-72">
        <label for="filtro-tipo" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por tipo:</label>
        <Dropdown v-model="filtroTipo" :options="tiposFiltro" optionLabel="label" optionValue="value"
                  placeholder="Seleccionar tipo" class="w-full"/>
      </div>
    </div>

    <!-- Tabla de Inversiones -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto Invertido</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="inversionesFiltradas.length === 0">
            <td colspan="5" class="text-center py-10 text-gray-500">No hay inversiones que coincidan con el filtro.</td>
          </tr>
          <tr v-for="inversion in inversionesFiltradas" :key="inversion.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ inversion.descripcion }}</div>
              <div class="text-sm text-gray-500">{{ inversion.beneficiario }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-500">{{ inversion.tipo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-800">
              {{ formatCurrency(inversion.monto) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <Tag :severity="getEstadoTag(inversion.estado).severity" :value="getEstadoTag(inversion.estado).text"
                   rounded/>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
              <Button v-if="inversion.tipo === 'credito'" icon="pi pi-eye" severity="info" text rounded
                      @click="verDetalleCredito(inversion)" v-tooltip.top="'Ver Detalles'"/>
              <Button icon="pi pi-pencil" severity="warning" text rounded @click="openEditModal(inversion)"
                      v-tooltip.top="'Editar'"/>
              <Button icon="pi pi-trash" severity="danger" text rounded @click="handleDeleteInversion(inversion.id)"
                      v-tooltip.top="'Eliminar'"/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para agregar o editar inversión -->
    <InversionModal v-model:visible="showModal" :is-edit-mode="isEditMode" :inversion-data="inversionToEdit"
                    @save="handleSaveInversion"/>
  </div>
</template>