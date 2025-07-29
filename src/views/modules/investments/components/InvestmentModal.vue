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
              :errors="v$.investment_type_id.$errors"
              :items="tiposInversion"
              optionLabel="nombre"
              placeholder="Tipo de Inversión*"
          />
        </div>
        <div>
          <Select
              v-model="v$.account_id.$model"
               :errors="v$.account_id.$errors"
              :items="cuentas"
              optionLabel="nombre"
              placeholder="Cuenta de Origen"
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
      <Button label="Cancelar" icon="pi pi-times" text @click="closeModal"/>
      <Button label="Guardar" icon="pi pi-check" @click="saveInversion"/>
    </template>
  </Dialog>
</template>
<script setup>
// --- IMPORTS ---
import {ref, watch, computed} from "vue";
import {helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Dialog from "primevue/dialog";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

// --- PROPS & EMITS ---
const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  inversionData: Object,
  tiposInversion: Array,
  cuentas: Array,
});
const emit = defineEmits(["update:visible", "save"]);

// --- ESTADO PRINCIPAL ---
const data = ref({
  investment_type_id: null,
  name: "",
  principal: 0,
  expected_return: 0,
  account_id: null,
  start_date: null,
  end_date: null,
  status: "",
  notes: "",
  id: null,
});
const submitted = ref(false);

// --- VALIDACIONES ---
const rules = {
  investment_type_id: {
    required: helpers.withMessage("El tipo de inversión es obligatorio.", required),
  },
  name: {
    required: helpers.withMessage("El nombre es obligatorio.", required),
  },
  principal: {
    required: helpers.withMessage("El monto es obligatorio.", required),
  },
  expected_return: {
    required: helpers.withMessage("El retorno esperado es obligatorio.", required),
  },
  account_id: {
    required: helpers.withMessage("La cuenta es obligatoria.", required),
  },
  start_date: {
    required: helpers.withMessage("La fecha de inversión es obligatoria.", required),
  },
  end_date: {
    required: helpers.withMessage("La fecha de vencimiento es obligatoria.", required),
  },
  notes: {
    required: helpers.withMessage("Las notas son obligatorias.", required),
  },
};
const v$ = useVuelidate(rules, data);

// --- WATCHERS ---
watch(
  () => props.inversionData,
  (newData) => {
    if (newData) {
      // Buscar el objeto completo en tiposInversion y cuentas usando value
      data.value.investment_type_id = Array.isArray(props.tiposInversion)
        ? props.tiposInversion.find(t => t.value == newData.investment_type_id) || null
        : null;
      data.value.account_id = Array.isArray(props.cuentas)
        ? props.cuentas.find(c => c.value == newData.account_id) || null
        : null;
      data.value.name = newData.name ?? "";
      data.value.principal = newData.principal !== undefined && newData.principal !== null
        ? +newData.principal
        : 0;
      data.value.expected_return = newData.expected_return !== undefined && newData.expected_return !== null
        ? +newData.expected_return
        : 0;
      data.value.start_date = newData.start_date ? new Date(newData.start_date) : null;
      data.value.end_date = newData.end_date ? new Date(newData.end_date) : null;
      data.value.status = newData.status ?? "";
      data.value.notes = newData.notes ?? "";
      data.value.id = newData.id ?? null;
    } else {
      data.value.investment_type_id = null;
      data.value.account_id = null;
      data.value.name = "";
      data.value.principal = 0;
      data.value.expected_return = 0;
      data.value.start_date = null;
      data.value.end_date = null;
      data.value.status = "";
      data.value.notes = "";
      data.value.id = null;
    }
  },
  { immediate: true }
);

// --- COMPUTEDS ---
const montoCalculado = computed(() => +data.value.principal || 0);
const gananciaCalculada = computed(
    () => (+data.value.expected_return || 0) - (+data.value.principal || 0)
);
const montoTotalCalculado = computed(() => +data.value.expected_return || 0);

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

const saveInversion = () => {
  submitted.value = true;
  if (v$.value.$invalid) {
    v$.value.$touch();
    return;
  }
  emit("save", {
    investment_type_id: data.value.investment_type_id?.value ?? null,
    name: data.value.name,
    principal: Number(data.value.principal),
    expected_return: Number(data.value.expected_return),
    account_id: data.value.account_id?.value ?? null,
    start_date: data.value.start_date
      ? data.value.start_date.toISOString().slice(0, 10)
      : null,
    end_date: data.value.end_date
      ? data.value.end_date.toISOString().slice(0, 10)
      : null,
    status: data.value.status,
    notes: data.value.notes,
    ...(data.value.id ? { id: data.value.id } : {}),
  });
};
</script>
