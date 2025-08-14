<template>
  <div class="space-y-6 p-4 sm:p-6 lg:p-8 bg-background-subtle min-h-screen">
    <Toast />
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

    <!-- Cards de cuentas con saldos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="cuenta in cuentasEfectivoYBanco" 
        :key="cuenta.id"
        class="bg-white rounded-lg shadow-md p-4 border-l-4"
        :class="getSaldoColor(cuenta.balance)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i :class="getIconoCuenta(cuenta)" class="mr-3 text-xl"></i>
            <div>
              <h3 class="text-sm font-medium text-gray-700">{{ cuenta.name }}</h3>
              <p class="text-xs text-gray-500">{{ getTipoCuenta(cuenta) }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold" :class="getSaldoTextColor(cuenta.balance)">
              {{ formatCurrency(cuenta.balance || 0) }}
            </div>
            <p class="text-xs text-gray-500">Disponible</p>
          </div>
        </div>
      </div>
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
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
          </tr>
          </thead>
          <tbody class="bg-background-light divide-y divide-neutral-100">
          <tr v-if="isLoading">
            <td colspan="6" class="px-6 py-4 text-center text-neutral-500">
              Cargando transacciones...
            </td>
          </tr>
          <tr v-else-if="transacciones.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-neutral-500">
              No hay transacciones registradas
            </td>
          </tr>
          <tr v-else v-for="tx in transacciones" :key="tx.id" class="hover:bg-background-subtle">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-neutral-900">{{ tx.description || tx.descripcion }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-semibold"
                :class="tx.tipo === 'ingreso' ? 'text-finance-500' : 'text-danger-500'">
              {{ formatCurrency(Math.abs(tx.amount || tx.monto)) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{{ getAccountName(tx.account_id || tx.cuentaId) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{{ getCategoryName(tx.category_id || tx.categoria) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{{ tx.date || tx.fecha }}</td>
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
        :cuentas="accounts"
        :categorias="categories"
        @save="handleSave"
    />
  </div>
</template>
<script setup>
import {ref, computed, onMounted} from 'vue';
import {useTransaccionesStore} from '../../../../stores/transactionStore.js';
import {storeToRefs} from 'pinia';
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";

import TransaccionModal from '../components/TransaccionModal.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const store = useTransaccionesStore();
const confirm = useConfirm();
const toast = useToast();

const {transacciones, accounts, categories, isLoading} = storeToRefs(store);
const {fetchTransactions, fetchCategories, fetchAccounts, addTransaccion, updateTransaccion, deleteTransaccion} = store;

const showModal = ref(false);
const transaccionToEdit = ref(null);

// Cargar datos al montar el componente
onMounted(async () => {
  await Promise.all([
    fetchTransactions(),
    fetchCategories(),
    fetchAccounts()
  ]);
});

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
}).format(value || 0);

const getAccountName = (id) => accounts.value.find(c => c.id === id)?.name || 'N/A';
const getCategoryName = (id) => categories.value.find(c => c.id === id)?.name || 'N/A';

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
    accept: async () => {
      const result = await deleteTransaccion(transaccion);
      if (result.success) {
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Transacción eliminada correctamente',
          life: 3000
        });
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'No se pudo eliminar la transacción',
          life: 5000
        });
      }
    },
  });
};

const handleSave = async (data) => {
  let result;
  
  if (data.id) {
    result = await updateTransaccion(data);
  } else {
    result = await addTransaccion(data);
  }
  
  if (result.success) {
    const message = data.id ? 'actualizada' : 'creada';
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Transacción ${message} correctamente`,
      life: 3000
    });
    showModal.value = false;
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result.error || 'No se pudo guardar la transacción',
      life: 5000
    });
  }
};

// Computed para filtrar cuentas de efectivo y banco
const cuentasEfectivoYBanco = computed(() => {
  if (!accounts.value) return [];
  return accounts.value.filter(cuenta => {
    const tipo = cuenta.name?.toLowerCase() || cuenta.tipo?.toLowerCase() || '';
    return tipo.includes('efectivo') || tipo.includes('banco') || tipo.includes('cash') || tipo.includes('bank');
  });
});

// Función para obtener el color del borde según el saldo
const getSaldoColor = (saldo) => {
  const balance = parseFloat(saldo || 0);
  if (balance > 1000) return 'border-green-500';
  if (balance > 0) return 'border-yellow-500';
  return 'border-red-500';
};

// Función para obtener el color del texto del saldo
const getSaldoTextColor = (saldo) => {
  const balance = parseFloat(saldo || 0);
  if (balance > 1000) return 'text-green-600';
  if (balance > 0) return 'text-yellow-600';
  return 'text-red-600';
};

// Función para obtener el ícono según el tipo de cuenta
const getIconoCuenta = (cuenta) => {
  const tipo = cuenta.name?.toLowerCase() || cuenta.tipo?.toLowerCase() || '';
  if (tipo.includes('efectivo') || tipo.includes('cash')) {
    return 'pi pi-money-bill text-green-600';
  }
  if (tipo.includes('banco') || tipo.includes('bank')) {
    return 'pi pi-building text-blue-600';
  }
  return 'pi pi-wallet text-gray-600';
};

// Función para obtener el tipo de cuenta legible
const getTipoCuenta = (cuenta) => {
  const tipo = cuenta.name?.toLowerCase() || cuenta.tipo?.toLowerCase() || '';
  if (tipo.includes('efectivo') || tipo.includes('cash')) {
    return 'Efectivo';
  }
  if (tipo.includes('banco') || tipo.includes('bank')) {
    return 'Banco';
  }
  return 'Cuenta';
};
</script>
