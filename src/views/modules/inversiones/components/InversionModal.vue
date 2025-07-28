<template>
  <Dialog
    :visible="props.visible"
    :style="{ width: '650px' }"
    :header="props.isEditMode ? 'Editar Inversión' : 'Registrar Inversión'"
    modal
    class="p-fluid"
    @update:visible="closeModal"
  >
    <div class="space-y-6 p-4">
      <!-- Campos Comunes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {{ props.tiposInversion }}
          <Select
            v-model="data.tipo"
            :items="props.tiposInversion"
            :errors="v$.tipo.$errors"
            optionLabel="nombre"
            placeholder="Tipo de Inversión*"
            class="w-full"
          />
        </div>
        <div>
          <Select
            v-model="v$.cuentaId.$model"
            :items="cuentas"
            :errors="v$.cuentaId.$errors"
            optionLabel="nombre"
            placeholder="Cuenta de Origen*"
            class="w-full"
          />
        </div>
        <div>
          <Select
            v-model="v$.cuentaDestinoId.$model"
            :items="cuentas"
            :errors="v$.cuentaDestinoId.$errors"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Cuenta de Destino*"
            class="w-full"
          />
        </div>
      </div>
      <!-- Descripción removida -->
      <div>
        <Input
          v-model="data.inversionName"
          placeholder="Nombre inversión*"
          class="w-full"
        />
      </div>

      <!-- Campos Condicionales para Compra -->
      <div
        v-if="data.tipo === 'compra'"
        class="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <Number
            v-model="data.cantidad"
            placeholder="Cantidad"
            :min="1"
            class="w-full"
          />
        </div>
        <div>
          <Number
            v-model="data.costoUnitario"
            placeholder="Costo Unitario"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            class="w-full"
          />
        </div>
        <div>
          <Number
            v-model="data.gananciaUnitaria"
            placeholder="Ganancia Unitaria"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            class="w-full"
          />
        </div>
      </div>

      <!-- Campos Condicionales para Crédito -->
      <div
        v-if="data.tipo === 'credito'"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <Number
            v-model="v$.monto.$model"
            :errors="v$.monto.$errors"
            placeholder="Monto del Préstamo*"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            class="w-full"
          />
        </div>
        <div>
          <Number
            v-model="data.interes"
            placeholder="Tasa de Interés (%)"
            suffix=" %"
            :min="0"
            class="w-full"
          />
        </div>
      </div>

      <!-- Resumen de Cálculos (siempre visible) -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md"
      >
        <div>
          <p class="text-sm text-gray-500">Monto Total Invertido</p>
          <p class="font-semibold text-gray-800">
            {{ formatCurrency(montoCalculado) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ganancia Estimada</p>
          <p class="font-semibold text-green-600">
            {{ formatCurrency(gananciaCalculada) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Monto Total a Recibir</p>
          <p class="font-semibold text-blue-600">
            {{ formatCurrency(montoTotalCalculado) }}
          </p>
        </div>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="fechaInversion"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Fecha de Inversión / Compra</label
          >
          <Calendar
            id="fechaInversion"
            v-model="data.fechaInversion"
            dateFormat="dd/mm/yy"
            showIcon
          />
        </div>
        <div>
          <label
            for="fechaVencimiento"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Fecha de Vencimiento / Venta</label
          >
          <Calendar
            id="fechaVencimiento"
            v-model="data.fechaVencimiento"
            dateFormat="dd/mm/yy"
            showIcon
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="closeModal" />
      <Button label="Guardar" icon="pi pi-check" @click="saveInversion" />
    </template>
  </Dialog>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useFinanceStore } from "../../../../stores/financeStore.js";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

// Componentes de PrimeVue
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

// Props y Emits
const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  inversionData: Object,
  tiposInversion: Array,
  cuentas: Array,
});
const emit = defineEmits(["update:visible", "save"]);

// Store
const store = useFinanceStore();
const { cuentas } = storeToRefs(store);

// State local y validación similar a CuentaModal
const data = ref({
  account_origen_id: "",
  account_destino_id: "",
  investment_type_id: "",
  investment_name: "",
  invested_amount: 0,
  interest: null,
  invested_amount: 1,
  unitCost: 0,
  profit: 0,
  total_amount: 0,
  investment_date: null,
  due_date: null,
  status: "",
});
const submitted = ref(false);

const rules = {
  cuentaId: { required },
  cuentaDestinoId: { required },
  tipo: { required },
  // descripcion: { required },
  monto: { required },
};
const v$ = useVuelidate(rules, data);

// Función helper para determinar el tipo basado en investment_type_id o tipo
const getTipoFromData = (data) => {
  if (data.tipo) return data.tipo;
  if (data.investment_type_id) {
    const tipoFound = props.tiposInversion.find(
      (type) => type.id === data.investment_type_id
    );
    return tipoFound ? tipoFound.value : null;
  }
  return null;
};

// Watcher para sincronizar props con el state local
watch(
  () => props.inversionData,
  (newData) => {
    if (newData) {
      data.value.cuentaId =
        newData.account_origen_id ?? newData.cuentaId ?? null;
      data.value.cuentaDestinoId =
        newData.account_destino_id ?? newData.cuentaDestinoId ?? null;
      data.value.tipo = newData.investment_type_id
        ? props.tiposInversion.find((t) => t.id === newData.investment_type_id)
            ?.value
        : newData.tipo ?? null;
      // data.value.descripcion = newData.investment_name ?? newData.descripcion ?? '';
      data.value.inversionName =
        newData.investment_name ?? newData.beneficiario ?? "";
      data.value.monto = newData.invested_amount ?? newData.monto ?? 0;
      data.value.interes = newData.interest ?? newData.interes ?? null;
      data.value.cantidad = newData.cantidad ?? 1;
      data.value.costoUnitario = newData.costoUnitario ?? 0;
      data.value.gananciaUnitaria = newData.gananciaUnitaria ?? 0;
      data.value.ganancia = newData.profit ?? newData.ganancia ?? 0;
      data.value.montoTotal = newData.total_amount ?? newData.montoTotal ?? 0;
      data.value.fechaInversion = newData.investment_date
        ? new Date(newData.investment_date + "T00:00:00")
        : newData.fechaInversion
        ? new Date(newData.fechaInversion + "T00:00:00")
        : null;
      data.value.fechaVencimiento = newData.due_date
        ? new Date(newData.due_date + "T00:00:00")
        : newData.fechaVencimiento
        ? new Date(newData.fechaVencimiento + "T00:00:00")
        : null;
      data.value.status = newData.status ?? newData.estado ?? "";
      // Si hay id, lo guardamos para edición
      if (newData.id) data.value.id = newData.id;
    }
  },
  { deep: true, immediate: true }
);

// También watcher que se ejecute cuando tiposInversion se carga
watch(
  [() => props.inversionData, () => props.tiposInversion],
  ([newData]) => {
    if (newData && props.tiposInversion.length > 0) {
      const tipoDetectado = getTipoFromData(newData);
      if (
        tipoDetectado &&
        (!data.value.tipo || tipoDetectado.value !== data.value.tipo.value)
      ) {
        data.value.tipo = tipoDetectado;
      }
    }
  },
  { deep: true }
);

// --- LÓGICA DE CÁLCULO CENTRALIZADA ---

// Calcula el monto total invertido basado en el tipo
const montoCalculado = computed(() => {
  const inv = data.value;
  if (inv.tipo && inv.tipo.value === "compra") {
    return (inv.cantidad || 0) * (inv.costoUnitario || 0);
  }
  return inv.monto || 0;
});

// Calcula la ganancia estimada basado en el tipo
const gananciaCalculada = computed(() => {
  const inv = data.value;
  if (inv.tipo && inv.tipo.value === "credito") {
    const monto = inv.monto || 0;
    const interes = inv.interes || 0;
    return monto * (interes / 100);
  }
  if (inv.tipo && inv.tipo.value === "compra") {
    return (inv.cantidad || 0) * (inv.gananciaUnitaria || 0);
  }
  return 0;
});

// Calcula el monto total a recibir
const montoTotalCalculado = computed(() => {
  return montoCalculado.value + gananciaCalculada.value;
});

// Watcher para actualizar el objeto principal con los valores calculados
watch(
  [montoCalculado, gananciaCalculada, montoTotalCalculado],
  ([newMonto, newGanancia, newMontoTotal]) => {
    if (data.value.tipo === "compra") {
      data.value.monto = newMonto;
    }
    data.value.ganancia = newGanancia;
    data.value.montoTotal = newMontoTotal;
  }
);

// --- MÉTODOS ---

const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
};

const closeModal = () => {
  emit("update:visible", false);
  submitted.value = false;
};

const preparePayload = () => {
  // Buscar el id del tipo de inversión seleccionado
  let investmentTypeId = null;
  if (data.value.tipo && Array.isArray(props.tiposInversion)) {
    const tipoObj = props.tiposInversion.find(
      (t) => t.value === data.value.tipo.value
    );
    if (tipoObj) investmentTypeId = tipoObj.id;
  }
  const payload = {
    account_origen_id: data.value.cuentaId
      ? parseInt(data.value.cuentaId)
      : null,
    account_destino_id: data.value.cuentaDestinoId
      ? parseInt(data.value.cuentaDestinoId)
      : null,
    investment_name: data.value.inversionName?.trim() || "",
    investment_type_id:
      data.value.tipo && data.value.tipo.id ? parseInt(data.value.tipo.id) : 0,
    invested_amount: data.value.monto ? parseFloat(data.value.monto) : null,
    interest:
      data.value.interes !== null &&
      data.value.interes !== undefined &&
      data.value.interes !== ""
        ? parseFloat(data.value.interes)
        : null,
    total_amount: data.value.montoTotal
      ? parseFloat(data.value.montoTotal)
      : null,
    profit:
      data.value.ganancia !== null &&
      data.value.ganancia !== undefined &&
      data.value.ganancia !== ""
        ? parseFloat(data.value.ganancia)
        : 0,
    investment_date: data.value.fechaInversion
      ? new Date(data.value.fechaInversion).toISOString()
      : "",
    due_date: data.value.fechaVencimiento
      ? new Date(data.value.fechaVencimiento).toISOString()
      : "",
    status: data.value.status?.trim() || "",
  };
  // Si estamos editando, incluir el id
  if (data.value.id) {
    payload.id = data.value.id;
  }
  return payload;
};

const saveInversion = async () => {
  submitted.value = true;
  v$.value.$touch();
  if (v$.value.$invalid) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }
  const payload = preparePayload();
  emit("save", payload);
};
</script>
