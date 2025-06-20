<script setup>
import {ref} from 'vue';
import {useFinanceStore} from '../stores/financeStore.js';
import {storeToRefs} from 'pinia';
import {useConfirm} from "primevue/useconfirm";

import IngresoModal from '../components/IngresoModal.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';

const store = useFinanceStore();
const confirm = useConfirm();

const showModal = ref(false);
const ingresoToEdit = ref(null);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
};

const {ingresos, cuentas} = storeToRefs(store);
const {deleteIngreso, addIngreso, updateIngreso} = store;
const openCreateModal = () => {
  ingresoToEdit.value = null;
  showModal.value = true;
};

const openEditModal = (ingreso) => {
  ingresoToEdit.value = {...ingreso};
  showModal.value = true;
};

const deleteIngresoConfir = (id) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar este ingreso?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteIngreso(id);
    },
    reject: () => {
      // No hacer nada si el usuario cancela
    }
  });
};

const handleSaveIngreso = (nuevoIngreso) => {
  if (nuevoIngreso.id) {
    updateIngreso(ingresoData);
  } else {
    addIngreso(ingresoData);
  }
  showModal.value = false;
  ingresoToEdit.value = null;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Componente de confirmación -->
    <ConfirmDialog/>

    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Ingresos</h1>
        <p class="text-gray-500 mt-1">Registra y administra tus fuentes de ingresos.</p>
      </div>
      <button @click="openCreateModal"
              class="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
        <span class="material-icons">add_circle_outline</span>
        <span>Agregar Ingreso</span>
      </button>
    </div>

    <!-- Tabla de Ingresos -->
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
          <tr v-for="ingreso in ingresos" :key="ingreso.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ ingreso.descripcion }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                            <span
                                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {{ ingreso.categoria }}
                            </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-green-600 font-semibold">{{ formatCurrency(ingreso.monto) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ ingreso.fecha }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <Button icon="pi pi-pencil" severity="info" text @click="openEditModal(ingreso)"/>
              <Button icon="pi pi-trash" severity="danger" text @click="deleteIngresoConfir(ingreso.id)"/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para agregar o editar ingreso -->
    <IngresoModal :show="showModal" :ingresoToEdit="ingresoToEdit" @close="showModal = false"
                  @save="handleSaveIngreso"/>
  </div>
</template>