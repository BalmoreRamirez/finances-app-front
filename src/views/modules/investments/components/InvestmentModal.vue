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
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Tipo de Inversión *</label
          >
          <Dropdown
            v-model="data.investment_type_id"
            :options="tiposInversion"
            optionLabel="nombre"
            optionValue="value"
            placeholder="Seleccionar tipo de inversión"
            class="w-full"
            :class="{ 'p-invalid': v$.investment_type_id.$error }"
          />
          <small v-if="v$.investment_type_id.$error" class="p-error">
            {{ v$.investment_type_id.$errors[0].$message }}
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Cuenta de Origen *</label
          >
          <Dropdown
            v-model="data.account_id"
            :options="cuentas"
            optionLabel="nombre"
            optionValue="value"
            placeholder="Seleccionar cuenta"
            class="w-full"
            :class="{ 'p-invalid': v$.account_id.$error }"
          />
          <small v-if="v$.account_id.$error" class="p-error">
            {{ v$.account_id.$errors[0].$message }}
          </small>
        </div>
      </div>

      <!-- Nombre de la inversión -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Nombre de la Inversión *</label
        >
        <InputText
          v-model="data.name"
          placeholder="Ingrese el nombre de la inversión"
          class="w-full"
          :class="{ 'p-invalid': v$.name.$error }"
        />
        <small v-if="v$.name.$error" class="p-error">
          {{ v$.name.$errors[0].$message }}
        </small>
      </div>

      <!-- Campos de montos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Monto Invertido *</label
          >
          <InputNumber
            v-model="data.principal"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            :min="1"
            placeholder="0.00"
            class="w-full"
            :class="{ 'p-invalid': v$.principal.$error }"
          />
          <small v-if="v$.principal.$error" class="p-error">
            {{ v$.principal.$errors[0].$message }}
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Retorno Esperado *</label
          >
          <InputNumber
            v-model="data.expected_return"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            :min="1"
            placeholder="0.00"
            class="w-full"
            :class="{ 'p-invalid': v$.expected_return.$error }"
          />
          <small v-if="v$.expected_return.$error" class="p-error">
            {{ v$.expected_return.$errors[0].$message }}
          </small>
        </div>
      </div>

      <!-- Notas -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Comentarios *</label
        >
        <Textarea
          v-model="data.notes"
          placeholder="Ingrese comentarios sobre la inversión"
          rows="3"
          class="w-full"
          :class="{ 'p-invalid': v$.notes.$error }"
        />
        <small v-if="v$.notes.$error" class="p-error">
          {{ v$.notes.$errors[0].$message }}
        </small>
      </div>

      <!-- Campo de Estado (solo en modo edición) -->
      <div v-if="props.isEditMode">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Estado de la Inversión *</label
        >
        <Dropdown
          v-model="data.status"
          :options="estadosInversion"
          optionLabel="nombre"
          optionValue="value"
          placeholder="Seleccionar estado"
          class="w-full"
          :class="{ 'p-invalid': v$.status.$error }"
        />
        <small v-if="v$.status.$error" class="p-error">
          {{ v$.status.$errors[0].$message }}
        </small>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Fecha de Inversión *</label
          >
          <Calendar
            v-model="data.start_date"
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Seleccionar fecha"
            class="w-full"
            :class="{ 'p-invalid': v$.start_date.$error }"
          />
          <small v-if="v$.start_date.$error" class="p-error">
            {{ v$.start_date.$errors[0].$message }}
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Fecha de Vencimiento *</label
          >
          <Calendar
            v-model="data.end_date"
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Seleccionar fecha"
            class="w-full"
            :class="{ 'p-invalid': v$.end_date.$error }"
          />
          <small v-if="v$.end_date.$error" class="p-error">
            {{ v$.end_date.$errors[0].$message }}
          </small>
        </div>
      </div>

      <!-- Resumen de Cálculos -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-background-light p-4 rounded-lg border border-neutral-100"
      >
        <div>
          <p class="text-sm text-text-muted">Monto Total Invertido</p>
          <p class="font-semibold text-primary">
            {{ formatCurrency(montoCalculado) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-text-muted">Ganancia Estimada</p>
          <p class="font-semibold text-success-500">
            {{ formatCurrency(gananciaCalculada) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-text-muted">Monto Total a Recibir</p>
          <p class="font-semibold text-secondary">
            {{ formatCurrency(montoTotalCalculado) }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="closeModal" />
      <Button
        label="Guardar"
        icon="pi pi-check"
        @click="saveInversion"
        :loading="saving"
      />
    </template>
  </Dialog>
</template>
<script setup>
// --- IMPORTS ---
import { ref, watch, computed } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Dialog from "primevue/dialog";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { useFinanceStore } from "../../../../stores/financeStore.js";

// --- PROPS & EMITS ---
const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  investmentData: Object, // Cambié de inversionData a investmentData
  accounts: Array, // Cambié de cuentas a accounts para que coincida con la vista
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
  status: "activa",
  notes: "",
  id: null,
});

const saving = ref(false);
const submitted = ref(false);

// --- OPCIONES DE ESTADO ---
const estadosInversion = ref([
  { nombre: "Activa", value: "activa" },
  { nombre: "Finalizada", value: "finalizada" },
  { nombre: "Cancelada", value: "cancelada" },
]);

// Computed para obtener los tipos de inversión y cuentas con el formato correcto
const tiposInversion = computed(() => {
  // Obtener desde el store de finanzas
  const store = useFinanceStore();
  return (store.investmentTypes || []).map(type => ({
    nombre: type.name || type.nombre,
    value: type.id || type.value
  }));
});

const cuentas = computed(() => {
  // Usar las cuentas pasadas como prop
  return (props.accounts || []).map(account => ({
    nombre: account.name || account.nombre,
    value: account.id || account.value
  }));
});

// --- VALIDACIONES ---
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
  status: {
    required: helpers.withMessage("El estado es obligatorio.", required),
  },
  notes: {
    required: helpers.withMessage("Las notas son obligatorias.", required),
  },
};
const v$ = useVuelidate(rules, data);

// --- WATCHERS ---
watch(
  () => props.investmentData,
  (newData) => {
    if (newData) {
      data.value.investment_type_id = newData.investment_type_id || null;
      data.value.account_id = newData.account_id || null;
      data.value.name = newData.name || "";
      data.value.principal = Number(newData.principal || newData.amount || 0);
      data.value.expected_return = Number(newData.expected_return || 0);
      data.value.start_date = newData.start_date ? new Date(newData.start_date) : null;
      data.value.end_date = newData.end_date ? new Date(newData.end_date) : null;
      data.value.status = newData.status || "activa";
      data.value.notes = newData.notes || "";
      data.value.id = newData.id || null;
    } else {
      // Resetear valores para nueva inversión
      data.value = {
        investment_type_id: null,
        account_id: null,
        name: "",
        principal: 0,
        expected_return: 0,
        start_date: new Date(),
        end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días después
        status: "activa",
        notes: "",
        id: null,
      };
    }
  },
  { immediate: true }
);

// --- COMPUTEDS ---
const montoCalculado = computed(() => +data.value.principal || 0);
const gananciaCalculada = computed(
  () => (+data.value.expected_return || 0))
const montoTotalCalculado = computed(() => +data.value.expected_return + +data.value.principal || 0);

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
  v$.value.$reset();
};

const saveInversion = async () => {
  submitted.value = true;
  saving.value = true;

  // Validar antes de enviar
  const isValid = await v$.value.$validate();
  if (!isValid) {
    saving.value = false;
    return;
  }

  const payload = {
    investment_type_id: data.value.investment_type_id,
    name: data.value.name,
    principal: Number(data.value.principal),
    expected_return: Number(data.value.expected_return),
    account_id: data.value.account_id,
    start_date: data.value.start_date ? data.value.start_date.toISOString().slice(0, 10) : null,
    end_date: data.value.end_date ? data.value.end_date.toISOString().slice(0, 10) : null,
    status: data.value.status,
    notes: data.value.notes,
  };

  if (props.isEditMode && data.value.id) {
    payload.id = data.value.id;
  }

  emit("save", payload);
  saving.value = false;
};
</script>
