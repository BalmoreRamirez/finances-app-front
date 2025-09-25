<template>
  <Dialog
    :visible="visible"
    modal
    :header="isEditMode ? 'Editar cuenta' : 'Agregar cuenta'"
    :style="{ width: '600px' }"
    @update:visible="closeModal"
  >
    <div class="space-y-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
      <div>
        <Input
          v-model="v$.name.$model"
          :errors="v$.name.$errors"
          placeholder="Ingrese el nombre de la cuenta"
          class="w-full"
        />
      </div>
      <div>
        <Select
          v-model="v$.account_type_id.$model"
          :errors="v$.account_type_id.$errors"
          :items="tiposCuenta"
          optionLabel="nombre"
          optionValue="value"
          placeholder="Selecciona un tipo de cuenta"
        />
      </div>
      <div class="mb-4">
        <Input
          v-model="stringBalance"
          :errors="v$.balance.$errors"
          placeholder="Balance"
        />
      </div>
      <div class="mb-4">
        <Input
          v-model="v$.currency.$model"
          :errors="v$.currency.$errors"
          placeholder="Ingrese la moneda"
        />
      </div>
       <div class="mb-4">
        <Input
          v-model="v$.description.$model"
          :errors="v$.description.$errors"
          placeholder="Description"
        />
      </div>
    </div>
    <div class="flex justify-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" text @click="closeModal" />
      <Button label="Guardar" icon="pi pi-check" @click="saveCuenta" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
// Computed para balance como string
const stringBalance = computed({
  get: () => data.value.balance != null ? String(data.value.balance) : "",
  set: val => {
    // Convierte a número si es posible, si no, deja 0
    data.value.balance = val === "" ? 0 : Number(val);
  }
});
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  cuentaData: Object,
  tiposCuenta: Array,
});
const emit = defineEmits(["update:visible", "save"]);

const submitted = ref(false);
const dollarRegex = /^\$?(\d{1,3})(,(\d{3}))*(\.\d{2})?$/;
const isDollar = helpers.withMessage(
  "El saldo debe ser un número válido en formato de dólar.",
  value => dollarRegex.test(value)
);
const data = ref({
  name: "",
  account_type_id: null,
  balance: 0,
  currency: "USD",
  description: "",
});

const rules = {
  name: {
    required: helpers.withMessage("El nombre es obligatorio.", required),
  },
  account_type_id: {
    required: helpers.withMessage( "El tipo de cuenta es obligatorio.", required),
  },
  balance: {
    required: helpers.withMessage("El saldo es obligatorio.", required),
    isDollar,
  },
  currency: {
    required: helpers.withMessage("La moneda es obligatoria.", required),
  },
  description: {
    required: helpers.withMessage("La descripción es obligatoria.", required),
  },
};

const v$ = useVuelidate(rules, data);

// Watch para manejar los datos del modal
watch(
  () => [props.visible, props.cuentaData, props.isEditMode],
  ([visible, newData, isEdit]) => {
    if (visible) {
      if (isEdit && newData) {
        // Modo edición - cargar datos existentes
        console.log("Datos recibidos para edición:", newData);
        data.value.name = newData.name || "";
        data.value.account_type_id = newData.account_type_id || null;
        data.value.balance = newData.balance !== undefined ? Number(newData.balance) : 0;
        data.value.currency = newData.currency || "USD";
        data.value.description = newData.description || "";
        console.log("account_type_id asignado:", data.value.account_type_id);
      } else {
        // Modo crear - resetear formulario
        resetForm();
      }
    }
  },
  { immediate: true }
);
const resetForm = () => {
  data.value = {
    name: "",
    account_type_id: null,
    balance: 0,
    currency: "USD",
    description: "",
  };
  submitted.value = false;
  v$.value.$reset();
};

const closeModal = () => {
  emit("update:visible", false);
  resetForm();
};

const saveCuenta = () => {
  submitted.value = true;
  if (v$.value.$invalid) {
    v$.value.$touch();
    return;
  }
  
  // Separar lógica para crear y editar
  if (props.isEditMode) {
    // Modo edición
    const payload = {
      accountId: props.cuentaData.accountId,
      name: data.value.name,
      account_type_id: data.value.account_type_id,
      balance: parseInt(data.value.balance),
      currency: data.value.currency,
      description: data.value.description,
    };
    emit("save", payload);
  } else {
    // Modo crear
    const payload = {
      name: data.value.name,
      account_type_id: data.value.account_type_id,
      balance: parseInt(data.value.balance),
      currency: data.value.currency,
      description: data.value.description,
    };
    emit("save", payload);
  }
  
  closeModal();
};


</script>
