<template>
  <div class="min-h-screen bg-background">
    <Toast />
    <ConfirmDialog />

    <!-- Header -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-text-primary">Gestión de Cuentas</h1>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cuenta
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="container mx-auto px-6 py-8">
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-100">
            <thead class="bg-background-light">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Saldo</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-background-white divide-y divide-neutral-50">
              <tr v-for="(cuenta, idx) in cuentasDeBalance" :key="cuenta.id" class="hover:bg-background-light transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-text-primary">{{ cuenta.name }}</td>
                <td class="px-6 py-4 text-sm">
                  <Tag :value="getTipoLabel(cuenta.account_type.name)" :severity="getTipoTagSeverity(cuenta.account_type.name)" />
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-text-primary">
                  {{ formatCurrency(cuenta.balance, cuenta.currency) }}
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center space-x-2">
                    <button
                      @click="openEditModal(cuenta)"
                      class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="handleDeleteCuenta(cuenta.id)"
                      class="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="cuentasDeBalance.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-text-muted">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p class="text-lg font-medium mb-1">No hay cuentas registradas</p>
                    <p class="text-sm">Crea tu primera cuenta para comenzar</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CuentaModal
      v-model:visible="showModal"
      :is-edit-mode="isEditMode"
      :cuenta-data="cuentaToEdit"
      :tipos-cuenta="tiposCuentaDeBalance"
      @save="handleSaveCuenta"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFinanceStore } from "../../../../stores/financeStore.js";
import { storeToRefs } from "pinia";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import CuentaModal from "../components/CuentaModal.vue";
import Tag from "primevue/tag";

// Store setup
const store = useFinanceStore();
const confirm = useConfirm();
const toast = useToast();

const {
  fetchAccounts,
  fetchAccountTypes,
  addCuenta,
  updateCuenta,
  deleteCuenta,
} = store;
const { accounts, accountTypes } = storeToRefs(store);

// State
const showModal = ref(false);
const isEditMode = ref(false);
const cuentaToEdit = ref(null);

// Lifecycle
onMounted(() => {
  if (accounts.value.length === 0) fetchAccounts();
  if (accountTypes.value.length === 0) fetchAccountTypes();
});

// Computed
const cuentasDeBalance = computed(() => accounts.value);
const tiposCuentaDeBalance = computed(() => accountTypes.value);

// Helpers
const formatCurrency = (value, currencyCode = "USD") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: currencyCode }).format(value);

const getTipoLabel = (tipoValue) => {
  if (!tipoValue) return "No Asignado";
  const tipo = accountTypes.value.find(
    (t) => t.nombre.toLowerCase() === tipoValue.toLowerCase()
  );
  return tipo ? tipo.nombre : tipoValue;
};

const getTipoTagSeverity = (tipo) => {
  switch (tipo) {
    case "activo":
      return "success";
    case "pasivo":
      return "warning";
    default:
      return "secondary";
  }
};

// Modal handlers
const openCreateModal = () => {
  isEditMode.value = false;
  cuentaToEdit.value = {
    name: "",
    account_type_id: null,
    balance: 0,
    currency: "USD",
  };
  showModal.value = true;
};

const openEditModal = (cuenta) => {
  isEditMode.value = true;
  let tipoCuentaObj = null;
  if (cuenta.account_type_id && typeof cuenta.account_type_id === "object") {
    tipoCuentaObj = accountTypes.value.find(tc => tc.value === cuenta.account_type_id.value) || cuenta.account_type_id;
  } else if (cuenta.account_type_id) {
    tipoCuentaObj = accountTypes.value.find(tc => tc.value === cuenta.account_type_id) || null;
  } else if (cuenta.accountTypeName) {
    tipoCuentaObj = accountTypes.value.find(tc => tc.nombre.toLowerCase() === cuenta.accountTypeName.toLowerCase()) || null;
  } else if (cuenta.tipo) {
    tipoCuentaObj = accountTypes.value.find(tc => tc.nombre.toLowerCase() === cuenta.tipo.toLowerCase()) || null;
  }
  cuentaToEdit.value = {
    accountId: cuenta.id,
    name: cuenta.name,
    account_type_id: tipoCuentaObj,
    balance: cuenta.balance ?? cuenta.saldo ?? 0,
    currency: cuenta.currency || cuenta.moneda || "USD",
  };
  showModal.value = true;
};

const handleSaveCuenta = async (cuentaData) => {
  if (isEditMode.value) {
    await updateCuenta(cuentaData);
  } else {
    await addCuenta(cuentaData);
  }
  showModal.value = false;
};

const handleDeleteCuenta = async (cuentaId) => {
  confirm.require({
    message: "¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.",
    header: "Confirmar Eliminación",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    acceptLabel: "Sí, eliminar",
    rejectLabel: "Cancelar",
    accept: async () => {
      await deleteCuenta(cuentaId);
    },
  });
};
</script>