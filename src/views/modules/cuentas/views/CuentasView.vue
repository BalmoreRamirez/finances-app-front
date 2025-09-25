<template>
  <div class="min-h-screen bg-background">
    <Toast />
    <ConfirmDialog />

    <!-- Header -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-text-primary">Gestión de Cuentas</h1>
        <Button label="Nueva Cuenta" icon="pi pi-plus"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          @click="openCreateModal" />
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="container mx-auto px-6 py-8">
      <div class="card">
        <DataTable :value="cuentasDeBalance" paginator :rows="7" tableStyle="min-width: 50rem">
          <Column field="id" header="ID"></Column>
          <Column field="name" header="Nombre"></Column>
          <Column field="type" header="Tipo">
            <template #body="slotProps">
              <Tag :value="slotProps.data.type"></Tag>
            </template>
          </Column>
          <Column field="saldo" header="Saldo"></Column>
          <Column header="Acciones" bodyStyle="text-align:center;">
            <template #body="slotProps">
              <div class="flex items-center justify-center space-x-2">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-primary"
                  @click="openEditModal(slotProps.data)" v-tooltip.top="'Editar'" aria-label="Editar" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                  @click="handleDeleteCuenta(slotProps.data.id)" v-tooltip.top="'Eliminar'" aria-label="Eliminar" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <CuentaModal v-model:visible="showModal" :is-edit-mode="isEditMode" :cuenta-data="cuentaToEdit"
      :tipos-cuenta="tiposCuentaDeBalance" @save="handleSaveCuenta" />
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
import DataTable from "primevue/datatable";
import Column from "primevue/column";

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
const cuentasDeBalance = computed(() => {
  return accounts.value.map((cuenta) => ({
    id: cuenta.id ?? null,
    name: cuenta.name ?? "Sin nombre",
    type: cuenta.account_type?.name || "No Asignado",
    account_type_id: cuenta.account_type_id || cuenta.account_type?.id || null,
    saldo: cuenta.balance ?? cuenta.saldo ?? 0,
    currency: cuenta.currency || cuenta.moneda || "USD",
    balance: cuenta.balance ?? cuenta.saldo ?? 0,
    description: cuenta.description || ""
  }));
});
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
  console.log("Cuenta original desde DataTable:", cuenta);
  
  // Buscar la cuenta completa del store para obtener todos los datos
  const cuentaCompleta = accounts.value.find(acc => acc.id === cuenta.id);
  console.log("Cuenta completa del store:", cuentaCompleta);
  
  let tipoCuentaValue = null;
  if (cuentaCompleta?.account_type_id) {
    tipoCuentaValue = cuentaCompleta.account_type_id;
  } else if (cuentaCompleta?.account_type?.id) {
    tipoCuentaValue = cuentaCompleta.account_type.id;
  }
  
  console.log("Tipo de cuenta value encontrado:", tipoCuentaValue);
  
  cuentaToEdit.value = {
    accountId: cuenta.id,
    name: cuenta.name || cuentaCompleta?.name || "",
    account_type_id: tipoCuentaValue,
    balance: cuenta.balance ?? cuenta.saldo ?? cuentaCompleta?.balance ?? 0,
    currency: cuenta.currency || cuentaCompleta?.currency || "USD",
    description: cuentaCompleta?.description || ""
  };
  
  console.log("Datos finales para el modal:", cuentaToEdit.value);
  showModal.value = true;
};

const handleSaveCuenta = async (cuentaData) => {
  try {
    const result = isEditMode.value
      ? await updateCuenta(cuentaData)
      : await addCuenta(cuentaData)
    console.log(result)
    if (result) {
      toast.add({
        severity: "success",
        summary: "Éxito",
        detail: "Cuenta agregada con exito",
        life: 3000
      });
      showModal.value = false;
      await fetchAccounts()
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: result?.error || "Error al guardar la cuenta",
        life: 5000
      });
    }

  } catch (e) {
    console.log(e)
  }
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