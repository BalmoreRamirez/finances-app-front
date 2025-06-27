<template>
  <div class="space-y-6 p-4 sm:p-6 lg:p-8 bg-background-subtle min-h-screen">
    <ConfirmDialog/>
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-neutral-900">Registro de Transacciones</h1>
      <Button
          label="Agregar Transacción"
          icon="pi pi-plus"
          @click="openCreateModal"
          class="btn bg-accent-500 hover:bg-accent-700 border-accent-500 text-white"
      />
    </div>

    <div class="bg-background-light rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-100">
          <thead class="bg-background-subtle">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Descripción
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Monto</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cuenta</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
          </tr>
          </thead>
          <tbody class="bg-background-light divide-y divide-neutral-100">
          <tr v-for="tx in transacciones" :key="tx.id + tx.tipo" class="hover:bg-background-subtle">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-neutral-900">{{ tx.descripcion }}</div>
              <div class="text-xs text-neutral-500">{{ tx.categoria }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-semibold"
                :class="tx.tipo === 'ingreso' ? 'text-finance-500' : 'text-danger-500'">
              {{ formatCurrency(tx.monto) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{{ getAccountName(tx.cuentaId) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{{ tx.fecha }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
              <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  @click="openEditModal(tx)"
                  class="text-accent-500 hover:bg-accent-50"
              />
              <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  @click="confirmDelete(tx)"
                  class="text-danger-500 hover:bg-danger-50"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TransaccionModal
        v-model:visible="showModal"
        :transaccion-to-edit="transaccionToEdit"
        :cuentas="cuentas"
        :deudas="deudas"
        :categorias="categoriasTransaccion"
        @save="handleSave"
    />
  </div>
</template>
<script setup>
import {ref, computed} from 'vue';
import {useFinanceStore} from '../../../../stores/financeStore.js';
import {storeToRefs} from 'pinia';
import {useConfirm} from "primevue/useconfirm";

import TransaccionModal from '../components/TransaccionModal.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';

const store = useFinanceStore();
const confirm = useConfirm();

const {transacciones, cuentas, deudas, categoriasTransaccion} = storeToRefs(store);
const {addTransaccion, updateTransaccion, deleteTransaccion} = store;

const showModal = ref(false);
const transaccionToEdit = ref(null);

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
}).format(value || 0);
const getAccountName = (id) => cuentas.value.find(c => c.id === id)?.nombre || 'N/A';

const openCreateModal = () => {
  transaccionToEdit.value = null;
  showModal.value = true;
};

const openEditModal = (transaccion) => {
  transaccionToEdit.value = {...transaccion};
  showModal.value = true;
};

const confirmDelete = (transaccion) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar esta transacción?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteTransaccion(transaccion);
    },
  });
};

const handleSave = (data) => {
  if (data.id) {
    updateTransaccion(data);
  } else {
    addTransaccion({...data, id: Date.now()});
  }
  showModal.value = false;
};
</script>
