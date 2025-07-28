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
          <Select
            v-model="v$.investment_type_id.$model"
            :items="props.tiposInversion"
            :errors="v$.investment_type_id.$errors"
            optionLabel="nombre"
            placeholder="Tipo de Inversión*"
            class="w-full"
          />
        </div>
        <div>
          <Select
            v-model="v$.account_id.$model"
            :items="cuentas"
            :errors="v$.account_id.$errors"
            optionLabel="nombre"
            placeholder="Cuenta de Origen*"
            class="w-full"
          />
        </div>
      </div>
      <!-- Descripción removida -->
      <div>
        <Input
          v-model="v$.name.$model"
          :errors="v$.name.$errors"
          placeholder="Nombre inversión*"
          class="w-full"
        />
      </div>

      <!-- Campos Condicionales para Compra -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Number
            v-model="v$.principal.$model"
            :errors="v$.principal.$errors"
            placeholder="Cantidad"
            :min="1"
            class="w-full"
          />
        </div>
        <div>
          <Number
            v-model="v$.expected_return.$model"
            :errors="v$.expected_return.$errors"
            placeholder="Costo Unitario"
            :min="1"
            class="w-full"
          />
        </div>
      </div>

      <div>
        <Input
          v-model="v$.notes.$model"
          :errors="v$.notes.$errors"
          placeholder="Notas"
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
          v-model="v$.start_date.$model"
          :errors="v$.start_date.$errors"
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
          v-model="v$.end_date.$model"
          :errors="v$.end_date.$errors"
          dateFormat="dd/mm/yy"
          showIcon
        />
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
import { helpers, required } from "@vuelidate/validators";

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

const data = ref({
  investment_type_id: "",
  name: "",
  principal: 0,
  expected_return: 0,
  account_id: "",
  start_date: null,
  end_date: null,
  status: "",
  notes: "",
});
const submitted = ref(false);

const rules = {
  investment_type_id: {
    required: helpers.withMessage(
      "El tipo de inversión es obligatorio.",
      required
    ),
  },
  name: {
    required: helpers.withMessage("El nombre es obligatorio.", required),
  },
  principal: {
    required: helpers.withMessage("El monto es obligatorio.", required),
  },
  expected_return: {
    required: helpers.withMessage(
      "El retorno esperado es obligatorio.",
      required
    ),
  },
  account_id: {
    required: helpers.withMessage("La cuenta es obligatoria.", required),
  },
  start_date: {
    required: helpers.withMessage(
      "La fecha de inversión es obligatoria.",
      required
    ),
  },
  end_date: {
    required: helpers.withMessage(
      "La fecha de vencimiento es obligatoria.",
      required
    ),
  },
  notes: {
    required: helpers.withMessage("Las notas son obligatorias.", required),
  },
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

watch(
  () => props.inversionData,
  (newData) => {
    if (newData) {
      // Mapeo para ambos tipos de inversión (compra, crédito) y backend
      data.value.tipo = newData.investment_type_id
        ? props.tiposInversion.find((t) => t.id === newData.investment_type_id)
        : null;
      data.value.inversionName = newData.name ?? newData.investment_name ?? "";
      data.value.monto = newData.principal ?? newData.monto ?? 0;
      data.value.montoTotal =
        newData.expected_return ?? newData.montoTotal ?? 0;
      data.value.cuentaId = newData.account_id ?? newData.cuentaId ?? null;
      data.value.fechaInversion = newData.start_date
        ? new Date(newData.start_date + "T00:00:00")
        : null;
      data.value.fechaVencimiento = newData.end_date
        ? new Date(newData.end_date + "T00:00:00")
        : null;
      data.value.status = newData.status ?? "";
      data.value.notas = newData.notes ?? "";
      // Para compatibilidad con edición de registros antiguos
      data.value.interes = newData.interest ?? null;
      data.value.cantidad = newData.cantidad ?? 1;
      data.value.costoUnitario = newData.costoUnitario ?? 0;
      data.value.gananciaUnitaria = newData.gananciaUnitaria ?? 0;
      data.value.ganancia = newData.ganancia ?? 0;
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
    investment_type_id:
      investmentTypeId ||
      (data.value.tipo && data.value.tipo.id) ||
      data.value.investment_type_id ||
      0,
    name: data.value.inversionName?.trim() || "",
    principal: data.value.monto ? Number(data.value.monto) : 0,
    expected_return: data.value.montoTotal ? Number(data.value.montoTotal) : 0,
    account_id: data.value.cuentaId ? Number(data.value.cuentaId) : null,
    start_date: data.value.fechaInversion
      ? new Date(data.value.fechaInversion).toISOString().slice(0, 10)
      : "",
    end_date: data.value.fechaVencimiento
      ? new Date(data.value.fechaVencimiento).toISOString().slice(0, 10)
      : "",
    status: data.value.status?.trim() || "",
    notes: data.value.notas || "",
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
