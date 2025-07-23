<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {storeToRefs} from 'pinia';
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useFinanceStore} from '../../../../stores/financeStore.js';
import investmentsService from '../../../../services/investmentsService.js';
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
const tiposInversion = ref([]);

const tiposFiltro = computed(() => [
  {label: 'Todas', value: 'todos'},
  ...tiposInversion.value.map(tipo => ({
    label: tipo.label,
    value: tipo.value
  }))
]);

onMounted(async () => {
  await Promise.all([
    fetchInvestments(),
    loadInvestmentTypes(),
    store.fetchAccounts() // Llamada para cargar las cuentas
  ]);
});

// Método actualizado para cargar tipos de inversión con el mapeo
const loadInvestmentTypes = async () => {
  try {
    const response = await investmentsService.getInvestmentTypes();
    // Mapear la respuesta del endpoint
    tiposInversion.value = response.data.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
      value: type.name.toLowerCase()
    }));
  } catch (error) {
    console.error('Error al cargar tipos de inversión:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los tipos de inversión.',
      life: 3000
    });
  }
};

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
    account_origen_id: 8,
    account_destino_id: 4,
    investment_name: "Compra y reventa de bicicleta de montaña",
    investment_type_id: 2,
    beneficiary: "Vendedor local",
    invested_amount: 100,
    interest: null,
    total_amount: 10,
    profit: 110,
    investment_date: "2025-08-01",
    due_date: "2025-09-01",
    status: "activo"
  };
  showModal.value = true;
};

const openEditModal = (inversion) => {
  isEditMode.value = true;
  inversionToEdit.value = {...inversion};
  showModal.value = true;
};

const handleSaveInversion = async (inversionData) => {
  console.log('Datos recibidos del modal:', inversionData);
  let success = false;
  const action = isEditMode.value ? 'actualizada' : 'creada';

  if (isEditMode.value) {
    success = await updateInversion(inversionToEdit.value.id, inversionData);
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

// Función actualizada para manejar el status del backend
const getEstadoTag = (status) => {
  switch (status) {
    case 'activo':
      return {severity: 'info', text: 'Activo'};
    case 'completado':
      return {severity: 'success', text: 'Completado'};
    case 'pagado':
      return {severity: 'success', text: 'Pagado'};
    case 'finalizado':
      return {severity: 'success', text: 'Finalizado'};
    case 'vencido':
      return {severity: 'danger', text: 'Vencido'};
    case 'cancelado':
      return {severity: 'warning', text: 'Cancelado'};
    case 'pendiente':
      return {severity: 'warning', text: 'Pendiente'};
    default:
      return {severity: 'secondary', text: status || 'Sin estado'};
  }
};

// Función helper para obtener el label del tipo
const getTipoLabel = (tipoValue) => {
  const tipo = tiposInversion.value.find(t => t.value === tipoValue);
  return tipo ? tipo.label : tipoValue;
};

const openModal = (inversion = null) => {
  inversionToEdit.value = inversion;
  isEditMode.value = !!inversion;
  showModal.value = true;
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
              <div class="text-sm font-medium text-gray-900">{{
                  inversion.investment_name || inversion.descripcion
                }}
              </div>
              <div class="text-sm text-gray-500">{{ inversion.beneficiary || inversion.beneficiario }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-500">
              {{ getTipoLabel(inversion.investment_type?.name || inversion.tipo) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-800">
              {{ formatCurrency(parseFloat(inversion.invested_amount || inversion.monto || 0)) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <Tag :severity="getEstadoTag(inversion.status || inversion.estado).severity"
                   :value="getEstadoTag(inversion.status || inversion.estado).text"
                   rounded/>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
              <Button v-if="(inversion.investment_type?.name || inversion.tipo) === 'credito'"
                      icon="pi pi-eye" severity="info" text rounded
                      @click="verDetalleCredito(inversion)"
                      v-tooltip.top="'Ver detalle del crédito'"/>
              <Button icon="pi pi-pencil" severity="warning" text rounded
                      @click="openEditModal(inversion)"
                      v-tooltip.top="'Editar inversión'"/>
              <Button icon="pi pi-trash" severity="danger" text rounded
                      @click="handleDeleteInversion(inversion.id)"
                      v-tooltip.top="'Eliminar inversión'"/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Pasamos los tipos de inversión como prop -->
    <InversionModal
      :visible="showModal"
      :isEditMode="isEditMode"
      :inversionData="inversionToEdit"
      :tiposInversion="tiposInversion"
      :cuentas="store.cuentas"
      @update:visible="showModal = $event"
      @save="handleSaveInversion"
    />
  </div>
</template>