<template>
  <div class="min-h-screen bg-background">
    <Toast />
    <ConfirmDialog/>

    <!-- Header -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-text-primary">Registro de Transacciones</h1>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Transacción
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="container mx-auto px-6 py-8 space-y-8">
      <!-- Cards de cuentas con saldos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="cuenta in cuentasEfectivoYBanco"
          :key="cuenta.id"
          class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                   :class="getTipoIconClass(cuenta)">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path :d="getIconPath(cuenta)" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-sm font-semibold text-text-primary">{{ cuenta.name }}</h3>
                <p class="text-xs text-text-muted">{{ getTipoCuenta(cuenta) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold" :class="getSaldoTextColor(cuenta.balance)">
                {{ formatCurrency(cuenta.balance) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de transacciones -->
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 class="text-lg font-semibold text-text-primary">Historial de Transacciones</h2>
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-text-muted">Categoría:</label>
              <Dropdown
                v-model="filtroCategoria"
                :options="categoriasFiltro"
                optionLabel="label"
                optionValue="value"
                placeholder="Todas las categorías"
                class="w-48"
                showClear
              />
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-text-muted">Cuenta:</label>
              <Dropdown
                v-model="filtroCuenta"
                :options="cuentasFiltro"
                optionLabel="label"
                optionValue="value"
                placeholder="Todas las cuentas"
                class="w-48"
                showClear
              />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-100">
            <thead class="bg-background-light">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Categoría</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cuenta</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Monto</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-background-white divide-y divide-neutral-50">
              <tr v-for="transaction in paginatedTransactions" :key="transaction.id" class="hover:bg-background-light transition-colors">
                <td class="px-6 py-4 text-sm text-text-primary">
                  {{ formatDate(transaction.date || transaction.fecha) }}
                </td>
                <td class="px-6 py-4 text-sm font-medium text-text-primary">
                  {{ transaction.description || transaction.descripcion }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getCategoryBadgeClass(transaction)">
                    {{ getCategoryName(transaction.category_id || transaction.categoria_id) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-text-muted">
                  {{ getAccountName(transaction.account_id || transaction.cuenta_id) }}
                </td>
                <td class="px-6 py-4 text-sm font-semibold"
                    :class="getAmountColor(transaction)">
                  {{ formatAmount(transaction) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="openEditModal(transaction)"
                      class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(transaction.id)"
                      class="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedTransactions.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-text-muted">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p class="text-lg font-medium mb-1">No hay transacciones</p>
                    <p class="text-sm">Registra tu primera transacción para comenzar</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div class="flex items-center text-sm text-text-muted">
            Mostrando {{ startIndex + 1 }} a {{ Math.min(endIndex, totalTransactions) }} de {{ totalTransactions }} transacciones
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-text-primary bg-background-light rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            <span class="px-3 py-2 text-sm font-medium text-text-primary">
              {{ currentPage }} de {{ totalPages }}
            </span>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-text-primary bg-background-light rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de transacción -->
    <TransaccionModal
      v-model:visible="showModal"
      :transaction="selectedTransaction"
      :is-edit="isEditMode"
      :accounts="cuentas"
      :categories="categorias"
      @saved="handleTransactionSaved"
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
import Dropdown from 'primevue/dropdown';

const store = useTransaccionesStore();
const confirm = useConfirm();
const toast = useToast();

const {transacciones, accounts, categories, isLoading} = storeToRefs(store);
const {fetchTransactions, fetchCategories, fetchAccounts, addTransaccion, updateTransaccion, deleteTransaccion} = store;

const showModal = ref(false);
const selectedTransaction = ref(null);
const isEditMode = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const filtroCategoria = ref(null);
const filtroCuenta = ref(null);

// Computed properties necesarios
const cuentas = computed(() => accounts.value || []);
const categorias = computed(() => categories.value || []);

// Filtros para dropdowns
const categoriasFiltro = computed(() => [
  { label: 'Todas las categorías', value: null },
  ...((categories.value || []).map(cat => ({ label: cat.name, value: cat.id })))
]);

const cuentasFiltro = computed(() => [
  { label: 'Todas las cuentas', value: null },
  ...((accounts.value || []).map(acc => ({ label: acc.name, value: acc.id })))
]);

// Paginación
const totalTransactions = computed(() => (transacciones.value || []).length);
const totalPages = computed(() => Math.ceil(totalTransactions.value / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);

const paginatedTransactions = computed(() => {
  const transactions = transacciones.value || [];
  return transactions.slice(startIndex.value, endIndex.value);
});

// Aplicar filtros a las transacciones
const filteredTransactions = computed(() => {
  return (transacciones.value || []).filter(transaction => {
    const byCategory = filtroCategoria.value ? transaction.category_id === filtroCategoria.value : true;
    const byAccount = filtroCuenta.value ? transaction.account_id === filtroCuenta.value : true;
    return byCategory && byAccount;
  });
});

// Funciones de paginación
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

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

const getAccountName = (id) => accounts.value?.find(c => c.id === id)?.name || 'N/A';
const getCategoryName = (id) => categories.value?.find(c => c.id === id)?.name || 'N/A';

const openCreateModal = () => {
  selectedTransaction.value = null;
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (transaccion) => {
  selectedTransaction.value = {...transaccion};
  isEditMode.value = true;
  showModal.value = true;
};

const confirmDelete = (transactionId) => {
  confirm.require({
    message: '¿Estás seguro de que deseas eliminar esta transacción?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const result = await deleteTransaccion(transactionId);
      if (result?.success) {
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
          detail: result?.error || 'No se pudo eliminar la transacción',
          life: 5000
        });
      }
    },
  });
};

const handleTransactionSaved = async (data) => {
  let result;
  
  if (data.id) {
    result = await updateTransaccion(data);
  } else {
    result = await addTransaccion(data);
  }
  
  if (result?.success) {
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
      detail: result?.error || 'No se pudo guardar la transacción',
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

// Función para obtener el color del texto del saldo
const getSaldoTextColor = (saldo) => {
  const balance = parseFloat(saldo || 0);
  if (balance > 1000) return 'text-success-500';
  if (balance > 0) return 'text-warning-500';
  return 'text-danger-500';
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

// Nueva función para obtener la clase del ícono según el tipo de cuenta (minimalista)
const getTipoIconClass = (cuenta) => {
  const tipo = cuenta.name?.toLowerCase() || cuenta.tipo?.toLowerCase() || '';
  if (tipo.includes('efectivo') || tipo.includes('cash')) {
    return 'bg-success-100 text-success-600';
  }
  if (tipo.includes('banco') || tipo.includes('bank')) {
    return 'bg-primary/10 text-primary';
  }
  return 'bg-neutral-100 text-neutral-600';
};

// Nueva función para obtener el path del ícono según el tipo de cuenta (minimalista)
const getIconPath = (cuenta) => {
  const tipo = cuenta.name?.toLowerCase() || cuenta.tipo?.toLowerCase() || '';
  if (tipo.includes('efectivo') || tipo.includes('cash')) {
    return 'M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z';
  }
  if (tipo.includes('banco') || tipo.includes('bank')) {
    return 'M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z';
  }
  return 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z';
};

// Nueva función para obtener la clase de la etiqueta de categoría (minimalista)
const getCategoryBadgeClass = (transaction) => {
  const categoryName = getCategoryName(transaction.category_id || transaction.categoria_id).toLowerCase();
  if (categoryName.includes('comida') || categoryName.includes('food')) {
    return 'bg-danger-100 text-danger-600';
  }
  if (categoryName.includes('transporte') || categoryName.includes('transport')) {
    return 'bg-primary/10 text-primary';
  }
  if (categoryName.includes('entretenimiento') || categoryName.includes('entertainment')) {
    return 'bg-warning-100 text-warning-600';
  }
  return 'bg-neutral-100 text-neutral-600';
};

// Nueva función para formatear la cantidad con signo (minimalista)
const formatAmount = (transaction) => {
  const amount = transaction.amount || transaction.monto || 0;
  return formatCurrency(Math.abs(amount));
};

// Nueva función para obtener el color del monto según el tipo (minimalista)
const getAmountColor = (transaction) => {
  const category = categories.value?.find(c => c.id === (transaction.category_id || transaction.categoria_id));
  return category?.type === 'ingreso' ? 'text-success-500' : 'text-danger-500';
};

// Nueva función para formatear la fecha (minimalista)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Intl.DateTimeFormat('es-MX', options).format(new Date(dateString));
};
</script>
