<script setup>
import {ref} from 'vue';
import { useFinanceStore } from '../stores/financeStore';
import { storeToRefs } from 'pinia';
import {useConfirm} from "primevue/useconfirm";

import GastoModal from '../components/GastoModal.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';

const store = useFinanceStore();
const confirm = useConfirm();

const showModal = ref(false);
const gastoToEdit = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

const { gastos, cuentas } = storeToRefs(store);
const { deleteGasto, addGasto, updateGasto } = store;

const openCreateModal = () => {
  gastoToEdit.value = null;
  showModal.value = true;
};

const openEditModal = (gasto) => {
  gastoToEdit.value = {...gasto};
  showModal.value = true;
};

const handleDeleteGasto = (id) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar este gasto?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      gastos.value = gastos.value.filter(item => item.id !== id);
    },
    reject: () => {
      // No hacer nada si el usuario cancela
    }
  });
};

const handleSaveGasto = (nuevoGasto) => {
  if (nuevoGasto.id) {
    // Editar gasto existente
    const index = gastos.value.findIndex(item => item.id === nuevoGasto.id);
    if (index !== -1) {
      gastos.value[index] = nuevoGasto;
    }
  } else {
    // Agregar nuevo gasto
    gastos.value.push({
      id: Date.now(),
      ...nuevoGasto,
    });
  }
  showModal.value = false;
  gastoToEdit.value = null;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Componente de confirmación -->
    <ConfirmDialog/>

    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
        <p class="text-gray-500 mt-1">Controla y categoriza todas tus salidas de dinero.</p>
      </div>
      <button @click="openCreateModal"
              class="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors">
        <span class="material-icons">add_circle_outline</span>
        <span>Agregar Gasto</span>
      </button>
    </div>

    <!-- Tabla de Gastos -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ gasto.descripcion }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ gasto.categoria }}
                  </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-red-600 font-semibold">{{ formatCurrency(gasto.monto) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ gasto.fecha }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <Button icon="pi pi-pencil" severity="info" text @click="openEditModal(gasto)"/>
              <Button icon="pi pi-trash" severity="danger" text @click="handleDeleteGasto(gasto.id)"/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para agregar o editar gasto -->
    <GastoModal :show="showModal" :gastoToEdit="gastoToEdit" @close="showModal = false" @save="handleSaveGasto"/>
  </div>
</template>