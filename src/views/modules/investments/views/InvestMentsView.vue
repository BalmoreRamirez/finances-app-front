<template>
  <div class="min-h-screen bg-background">
    <Toast/>
    <ConfirmDialog/>

    <!-- Header -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-text-primary">Gestión de Inversiones</h1>
          <p class="text-sm text-text-muted mt-1">Administra tus inversiones y créditos otorgados</p>
        </div>
        <button
            @click="openCreateModal"
            class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Registrar Inversión
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="container mx-auto px-6 py-8 space-y-8">
      <!-- Cards de resumen estadístico -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Total Invertido</p>
              <p class="text-2xl font-semibold text-primary">{{ formatCurrency(totalInvertido) }}</p>
            </div>
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Ganancias Potenciales</p>
              <p class="text-2xl font-semibold text-success-500">{{ formatCurrency(totalGananciasPotenciales) }}</p>
            </div>
            <div class="w-12 h-12 bg-success-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Ingresos por Intereses</p>
              <p class="text-2xl font-semibold text-secondary">{{ formatCurrency(totalGananciasAcumuladas) }}</p>
            </div>
            <div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Inversiones Activas</p>
              <p class="text-2xl font-semibold text-warning-500">{{ totalInvertidoActivo }}</p>
            </div>
            <div class="w-12 h-12 bg-warning-500/10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Título de la sección de la tabla -->
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <h2 class="text-lg font-semibold text-text-primary">Lista de Inversiones</h2>
      </div>

      <!-- Tabla de Inversiones -->
      <div class="card">
        <DataTable :value="dataInvestment"
                   paginator
                   :rows="7"
                   size="small"
                   tableStyle="min-width: 50rem">
          <Column field="id" header="ID"></Column>
          <Column field="name" header="Inversión"></Column>
          <Column field="type" header="Tipo"></Column>
          <Column field="account" header="Cuenta"></Column>
          <Column field="amount_invested" header="Monto Invertido">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.amount_invested) }}
            </template>
          </Column>
          <Column field="profit" header="Ganancia">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.profit) }}
            </template>
          </Column>
          <Column field="paid" header="Total pagado">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.paid) }}
            </template>
          </Column>
          <Column field="status" header="Estado">
            <template #body="slotProps">
              <Tag
                  :value="getStatusLabel(slotProps.data.status)"
                  :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex items-center justify-start space-x-2">
                <button
                    @click="openEditModal(slotProps.data)"
                    class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Editar inversión"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                    v-if="esTipoCredito(slotProps.data.original)"
                    @click="verDetallePagos(slotProps.data.original)"
                    class="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    title="Ver pagos"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </button>
                <button
                    @click="confirmDelete(slotProps.data.id)"
                    class="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Eliminar inversión"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Modal de inversión -->
    <InvestmentModal
        v-model:visible="showModal"
        :is-edit-mode="isEditMode"
        :investment-data="inversionToEdit"
        :accounts="accounts"
        @save="handleSaveInvestment"
    />
  </div>
</template>

<script setup>
// Imports
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import {useFinanceStore} from "../../../../stores/financeStore.js";
import {useInversionesStore} from "../../../../stores/investmentStore.js";
import {useCuentasStore} from "../../../../stores/accountStore.js";
import ConfirmDialog from "primevue/confirmdialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InvestmentModal from "../components/InvestmentModal.vue";
import Toast from "primevue/toast";
import Tag from "primevue/tag";

// Composables
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// Stores
const financeStore = useFinanceStore();
const investmentStore = useInversionesStore();
const cuentasStore = useCuentasStore();

// Store State & Actions
const {
  investments,
  accountForSelect,
} = storeToRefs(financeStore);
const {
  deleteInvestment,
  addInvestment,
  updateInvestment,
  fetchInvestments,
  fetchInvestmentTypes,
  fetchAccountsForSelect,
} = financeStore;

// Local State
const showModal = ref(false);
const isEditMode = ref(false);
const inversionToEdit = ref(null);
const pagosPorInversion = ref({});

// Computed Properties
const accounts = computed(() => accountForSelect.value || []);
let cont = 0;
const dataInvestment = computed(() =>
    investments.value
        .slice() // Crear una copia para no mutar el estado original
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date)) // Ordenar por fecha descendente
        .map((investment, index) => ({
          id: index+1,
          name: investment.name || investment.nombre || "-",
          type: investment.investment_type?.name || nameType(investment.investment_type_id) || "-",
          account: investment.account.name,
          amount_invested: parseFloat(investment.principal || 0),
          profit: parseFloat(investment.expected_return || 0),
          paid: getTotalPagado(investment),
          status: (investment.status || '').toLowerCase(),
          original: investment, // Guardar referencia al objeto original
        }))
);

const totalInvertido = computed(() => {
  return (investments.value || [])
      .filter(inv => (inv.status || '').toLowerCase() === 'activa')
      .reduce((sum, inv) => sum + parseFloat(inv.principal || 0), 0);
});

const totalGananciasPotenciales = computed(() => {
  return (investments.value || [])
      .filter(inv => (inv.status || '').toLowerCase() === 'activa')
      .reduce((sum, inv) => sum + parseFloat(inv.expected_return || 0), 0);
});

const nameType = (typeId) => {
  const tipo = investmentStore.typesInvestment.find(t => t.id === typeId || t.value === typeId);
  return tipo ? tipo.name || tipo.label : typeId || 'No Asignado';
};
const totalGananciasAcumuladas = computed(() => {
  const cuentas = cuentasStore.cuentas || [];
  const cuentasIngresoIntereses = cuentas.filter(cuenta => {
    const nombre = (cuenta.name || '').toLowerCase();
    return nombre.includes('ingreso') && (nombre.includes('interés') || nombre.includes('interes'));
  });
  return cuentasIngresoIntereses.reduce((total, cuenta) => total + parseFloat(cuenta.balance || 0), 0);
});

const totalInvertidoActivo = computed(() => {
  return investments.value.filter(inv => (inv.status || '').toLowerCase() === 'activa').length;
});

// Lifecycle Hooks
onMounted(async () => {
  try {
    // El manejo de sesión expirada es global (api.js), solo cargamos datos.
    await fetchInvestments();
    await fetchInvestmentTypes();
    await fetchAccountsForSelect();
    await cuentasStore.fetchAccounts();
    await cargarPagosCreditos();
  } catch (error) {
    // El interceptor global ya maneja los errores de autenticación.
    // Aquí solo manejamos otros posibles errores de carga.
    console.error("Error al cargar datos iniciales:", error);
    toast.add({
      severity: "error",
      summary: "Error de Carga",
      detail: "No se pudieron cargar los datos. Inténtalo de nuevo.",
      life: 5000,
    });
  }
});

// Methods
const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return num.toLocaleString("en-US", {style: "currency", currency: "USD"});
};

const esTipoCredito = (inversion) => {
  if (!inversion) return false;
  const tipo = (inversion.investment_type?.name || '').toLowerCase();
  return tipo.includes('crédito') || tipo.includes('credito');
};

const cargarPagosCreditos = async () => {
  const inversionesCredito = investments.value.filter(inv => esTipoCredito(inv));
  for (const inversion of inversionesCredito) {
    try {
      const result = await investmentStore.fetchPaymentsByInvestment(inversion.id);
      if (result.success) {
        pagosPorInversion.value[inversion.id] = investmentStore.payments || [];
      }
    } catch (error) {
      console.error(`Error al cargar pagos para inversión ${inversion.id}:`, error);
      pagosPorInversion.value[inversion.id] = [];
    }
  }
};

const getTotalPagado = (inversion) => {
  const pagos = pagosPorInversion.value[inversion.id] || [];
  return pagos.reduce((total, pago) => total + parseFloat(pago.amount || pago.monto || 0), 0);
};

const getStatusSeverity = (status) => {
  const estado = (status || '').toLowerCase();
  switch (estado) {
    case 'activa':
      return 'success';
    case 'finalizada':
      return 'info';
    case 'vencido':
      return 'danger';
    case 'pendiente':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status) => {
  const estado = (status || '').toLowerCase();
  return estado.charAt(0).toUpperCase() + estado.slice(1) || 'Sin estado';
};

const getAccountName = (accountId) => {
  if (!accountId) return 'Sin cuenta';
  const account = accounts.value.find(acc => acc.id === accountId || acc.value === accountId);
  return account?.name || account?.label || 'No encontrada';
};

const formatearFechaLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const openCreateModal = () => {
  const fechaActual = new Date();
  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaActual.getDate() + 15);

  isEditMode.value = false;
  inversionToEdit.value = {
    investment_type_id: "",
    name: "",
    principal: 0,
    expected_return: 0,
    account_id: "",
    start_date: formatearFechaLocal(fechaActual),
    end_date: formatearFechaLocal(fechaVencimiento),
    status: "activa",
    notes: "",
  };
  showModal.value = true;
};

const openEditModal = (investment) => {
  isEditMode.value = true;
  inversionToEdit.value = {...investment.original};
  showModal.value = true;
};

const handleSaveInvestment = async (inversionData) => {
  try {
    const result = isEditMode.value
        ? await updateInvestment(inversionToEdit.value.id, inversionData)
        : await addInvestment(inversionData);

    if (result && result.success) {
      toast.add({severity: "success", summary: "Éxito", detail: result.message, life: 3000});
      showModal.value = false;
      await fetchInvestments();
      await cargarPagosCreditos();
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: result?.error || "No se pudo guardar la inversión",
        life: 5000
      });
    }
  } catch (error) {
    console.error("Error al guardar la inversión:", error);
    toast.add({severity: "error", summary: "Error", detail: "Error inesperado al guardar la inversión", life: 5000});
  }
};

const confirmDelete = (id) => {
  confirm.require({
    message: "¿Estás seguro de que deseas eliminar esta inversión? Esta acción no se puede deshacer.",
    header: "Confirmar eliminación",
    icon: "pi pi-exclamation-triangle",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        const result = await deleteInvestment(id);
        if (result.success) {
          toast.add({severity: "success", summary: "Éxito", detail: result.message, life: 3000});
          await fetchInvestments();
          await cargarPagosCreditos();
        } else {
          toast.add({severity: "error", summary: "Error", detail: result.error, life: 5000});
        }
      } catch (error) {
        console.error("Error al eliminar la inversión:", error);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Error inesperado al eliminar la inversión",
          life: 5000
        });
      }
    },
  });
};

const verDetallePagos = (inversion) => {
  router.push({name: 'detalle-credito', params: {id: inversion.id}});
};
</script>