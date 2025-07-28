<template>
  <Dialog :visible="visible" modal header="Cuenta" :style="{ width: '400px' }" @update:visible="closeModal">
    <form @submit.prevent="saveCuenta">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <InputText v-model="v$.name.$model" :class="{ 'p-invalid': v$.name.$error }" />
        <small v-if="v$.name.$error" class="p-error">{{ v$.name.$errors[0].$message }}</small>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Tipo de Cuenta</label>
        <Dropdown
          v-model="v$.account_type_id.$model"
          :options="tiposCuenta"
          optionLabel="nombre"
          optionValue="value"
          placeholder="Selecciona un tipo"
          :class="{ 'p-invalid': v$.account_type_id.$error }"
        />
        <small v-if="v$.account_type_id.$error" class="p-error">{{ v$.account_type_id.$errors[0].$message }}</small>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Saldo</label>
        <InputNumber v-model="v$.balance.$model" mode="currency" currency="USD" locale="en-US" :class="{ 'p-invalid': v$.balance.$error }" />
        <small v-if="v$.balance.$error" class="p-error">{{ v$.balance.$errors[0].$message }}</small>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Moneda</label>
        <InputText v-model="v$.currency.$model" :class="{ 'p-invalid': v$.currency.$error }" />
        <small v-if="v$.currency.$error" class="p-error">{{ v$.currency.$errors[0].$message }}</small>
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" icon="pi pi-times" text @click="closeModal" />
        <Button label="Guardar" icon="pi pi-check" type="submit" />
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";

const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  cuentaData: Object,
  tiposCuenta: Array,
});
const emit = defineEmits(["update:visible", "save"]);

const submitted = ref(false);

const data = ref({
  name: "",
  account_type_id: null,
  balance: 0,
  currency: "USD",
});

const rules = {
  name: { required: helpers.withMessage("El nombre es obligatorio.", required) },
  account_type_id: { required: helpers.withMessage("El tipo de cuenta es obligatorio.", required) },
  balance: { required: helpers.withMessage("El saldo es obligatorio.", required) },
  currency: { required: helpers.withMessage("La moneda es obligatoria.", required) },
};

const v$ = useVuelidate(rules, data);

watch(
  () => props.cuentaData,
  (newData) => {
    if (newData) {
      data.value.name = newData.name || "";
      data.value.account_type_id = newData.account_type_id?.value || newData.account_type_id || null;
      data.value.balance = newData.balance || 0;
      data.value.currency = newData.currency || "USD";
    }
  },
  { immediate: true }
);

const closeModal = () => {
  emit("update:visible", false);
  submitted.value = false;
};

const saveCuenta = () => {
  submitted.value = true;
  if (v$.value.$invalid) {
    v$.value.$touch();
    return;
  }
  const payload = {
    name: data.value.name,
    account_type_id: data.value.account_type_id,
    balance: data.value.balance,
    currency: data.value.currency,
  };
  if (props.cuentaData && props.cuentaData.accountId) {
    payload.accountId = props.cuentaData.accountId;
  }
  emit("save", payload);
  closeModal();
};
</script>