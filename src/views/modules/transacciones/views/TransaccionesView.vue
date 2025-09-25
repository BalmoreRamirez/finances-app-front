<template>
  <div class="min-h-screen bg-background">
    <Toast />
    <ConfirmDialog />

    <!-- Header -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-text-primary">Registro de Transacciones</h1>
        <Button @click="openCreateModal" label="Agregar Transacción" icon="pi pi-plus"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors" />
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="container mx-auto px-6 py-8 space-y-8">
      <!-- Cards de cuentas con saldos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="cuenta in cuentasEfectivoYBanco" :key="cuenta.id"
          class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="getTipoIconClass(cuenta)">
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

      <!-- DataTable de transacciones -->
      <div class="card">
        <DataTable :value="filteredTransactions" :loading="isLoading" paginator :rows="10" sortMode="multiple"
          removableSort :globalFilterFields="['description', 'descripcion']" tableStyle="min-width: 50rem"
          class="p-datatable-sm">
          <template #header>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4">
              <h2 class="text-lg font-semibold text-text-primary">Historial de Transacciones</h2>
              <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-text-muted">Buscar:</label>
                  <InputText v-model="globalFilter" placeholder="Buscar transacciones..." class="w-64" />
                </div>
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-text-muted">Categoría:</label>
                  <Dropdown v-model="filtroCategoria" :options="categoriasFiltro" optionLabel="label"
                    optionValue="value" placeholder="Todas las categorías" class="w-48" showClear />
                </div>
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-text-muted">Cuenta:</label>
                  <Dropdown v-model="filtroCuenta" :options="cuentasFiltro" optionLabel="label" optionValue="value"
                    placeholder="Todas las cuentas" class="w-48" showClear />
                </div>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="flex flex-col items-center py-12">
              <i class="pi pi-inbox text-4xl text-neutral-300 mb-4"></i>
              <p class="text-lg font-medium mb-1 text-text-muted">No hay transacciones</p>
              <p class="text-sm text-text-muted">Registra tu primera transacción para comenzar</p>
            </div>
          </template>

          <Column field="date" header="Fecha" sortable style="min-width: 120px">
            <template #body="slotProps">
              <span class="text-sm text-text-primary">
                {{ formatDate(slotProps.data.date || slotProps.data.fecha) }}
              </span>
            </template>
          </Column>

          <Column field="description" header="Descripción" sortable style="min-width: 200px">
            <template #body="slotProps">
              <span class="text-sm font-medium text-text-primary">
                {{ slotProps.data.description || slotProps.data.descripcion }}
              </span>
            </template>
          </Column>

          <Column field="category_id" header="Categoría" sortable style="min-width: 150px">
            <template #body="slotProps">
              <Tag :value="getCategoryName(slotProps.data.category_id || slotProps.data.categoria_id)"
                :class="getCategoryBadgeClass(slotProps.data)" class="text-xs font-medium" />
            </template>
          </Column>

          <Column field="account_id" header="Cuenta" sortable style="min-width: 150px">
            <template #body="slotProps">
              <span class="text-sm text-text-muted">
                {{ getAccountName(slotProps.data.account_id || slotProps.data.cuenta_id) }}
              </span>
            </template>
          </Column>

          <Column field="amount" header="Monto" sortable style="min-width: 130px">
            <template #body="slotProps">
              <span class="text-sm font-semibold" :class="getAmountColor(slotProps.data)">
                {{ formatAmount(slotProps.data) }}
              </span>
            </template>
          </Column>

          <Column header="Acciones" style="min-width: 120px" bodyStyle="text-align: center">
            <template #body="slotProps">
              <div class="flex items-center justify-center space-x-2">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-primary"
                  @click="openEditModal(slotProps.data)" v-tooltip.top="'Editar'" aria-label="Editar" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                  @click="confirmDelete(slotProps.data.id)" v-tooltip.top="'Eliminar'" aria-label="Eliminar" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Modal de transacción -->
    <TransaccionModal v-model:visible="showModal" :transaction="selectedTransaction" :is-edit="isEditMode"
      :accounts="cuentas" :categories="categorias" @saved="handleTransactionSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTransaccionesStore } from '../../../../stores/transactionStore.js';
import { storeToRefs } from 'pinia';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import TransaccionModal from '../components/TransaccionModal.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';

const store = useTransaccionesStore();
const confirm = useConfirm();
const toast = useToast();

const { transacciones, accounts, categories, isLoading } = storeToRefs(store);
const { fetchTransactions, fetchCategories, fetchAccounts, addTransaccion, updateTransaccion, deleteTransaccion } = store;

const showModal = ref(false);
const selectedTransaction = ref(null);
const isEditMode = ref(false);
const filtroCategoria = ref(null);
const filtroCuenta = ref(null);
const globalFilter = ref('');

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

// Aplicar filtros a las transacciones
const filteredTransactions = computed(() => {
  let filtered = transacciones.value || [];

  // Filtro por categoría
  if (filtroCategoria.value) {
    filtered = filtered.filter(transaction =>
      (transaction.category_id || transaction.categoria_id) === filtroCategoria.value
    );
  }

  // Filtro por cuenta
  if (filtroCuenta.value) {
    filtered = filtered.filter(transaction =>
      (transaction.account_id || transaction.cuenta_id) === filtroCuenta.value
    );
  }

  // Filtro global por descripción
  if (globalFilter.value) {
    const searchTerm = globalFilter.value.toLowerCase();
    filtered = filtered.filter(transaction => {
      const description = (transaction.description || transaction.descripcion || '').toLowerCase();
      return description.includes(searchTerm);
    });
  }

  return filtered;
});

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
  selectedTransaction.value = { ...transaccion };
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
    return tipo.includes('efectivo') || tipo.includes('banco') || tipo.includes('ingreso por interés') || tipo.includes('cash') || tipo.includes('bank');
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

// Función para obtener la severidad del tag de categoría
const getCategoryBadgeClass = (transaction) => {
  const categoryName = getCategoryName(transaction.category_id || transaction.categoria_id).toLowerCase();
  if (categoryName.includes('comida') || categoryName.includes('food')) {
    return 'p-tag-danger';
  }
  if (categoryName.includes('transporte') || categoryName.includes('transport')) {
    return 'p-tag-info';
  }
  if (categoryName.includes('entretenimiento') || categoryName.includes('entertainment')) {
    return 'p-tag-warning';
  }
  return 'p-tag-secondary';
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
