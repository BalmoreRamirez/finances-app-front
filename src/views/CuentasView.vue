<script setup>
import {ref} from 'vue';
import {useFinanceStore} from '../stores/financeStore';
import {storeToRefs} from 'pinia';
import {useConfirm} from "primevue/useconfirm";
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import CuentaModal from '../components/CuentaModal.vue'; // Asegúrate que la ruta sea correcta

const store = useFinanceStore();
const confirm = useConfirm();

const {cuentas} = storeToRefs(store);
const {addCuenta, updateCuenta, deleteCuenta} = store;

// Estado para controlar el modal
const showModal = ref(false);
const isEditMode = ref(false);
const cuentaToEdit = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

// --- Funciones para abrir el modal ---
const openCreateModal = () => {
  isEditMode.value = false;
  cuentaToEdit.value = {id: null, nombre: '', saldo: 0};
  showModal.value = true;
};

const openEditModal = (cuenta) => {
  isEditMode.value = true;
  cuentaToEdit.value = {...cuenta};
  showModal.value = true;
};

// --- Funciones de guardado y borrado ---
const handleSaveCuenta = (cuentaData) => {
  if (isEditMode.value) {
    updateCuenta(cuentaData);
  } else {
    addCuenta(cuentaData);
  }
};

const handleDeleteCuenta = (cuentaId) => {
  confirm.require({
    message: '¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      deleteCuenta(cuentaId);
    },
  });
};
</script>

<template>
  <ConfirmDialog></ConfirmDialog>

  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">Gestión de Cuentas</h1>
      <Button label="Nueva Cuenta" icon="pi pi-plus" @click="openCreateModal"/>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="cuenta in cuentas" :key="cuenta.id">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ cuenta.nombre }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-700">{{ formatCurrency(cuenta.saldo) }}</td>
            <td class="px-6 py-4 text-center space-x-2">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text"
                      @click="openEditModal(cuenta)"/>
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text"
                      @click="handleDeleteCuenta(cuenta.id)"/>
            </td>
          </tr>
          <tr v-if="cuentas.length === 0">
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">No hay cuentas registradas.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Componente del Modal -->
  <CuentaModal
      v-model:visible="showModal"
      :is-edit-mode="isEditMode"
      :cuenta-data="cuentaToEdit"
      @save="handleSaveCuenta"
  />
</template>