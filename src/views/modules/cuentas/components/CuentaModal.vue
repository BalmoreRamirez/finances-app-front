<template>
  <Dialog
    :visible="visible"
    modal
    header="Cuenta"
    :style="{ width: '400px' }"
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
          placeholder="Selecciona un tipo de cuenta"
        />
      </div>
      <div class="mb-4">
        <Number
          v-model="v$.balance.$model"
          :class="{ 'p-invalid': v$.balance.$error }"
        />
      </div>
      <div class="mb-4">
        <Input
          v-model="v$.currency.$model"
          :errors="v$.currency.$error"
          placeholder="Ingrese la moneda"
        />
      </div>
       <div class="mb-4">
        <Input
          v-model="v$.description.$model"
          :errors="v$.description.$error"
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
import { ref, watch } from "vue";
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
    required: helpers.withMessage(
      "El tipo de cuenta es obligatorio.",
      required
    ),
  },
  balance: {
    required: helpers.withMessage("El saldo es obligatorio.", required),
  },
  currency: {
    required: helpers.withMessage("La moneda es obligatoria.", required),
  },
  description: {
    required: helpers.withMessage("La descripción es obligatoria.", required),
  },
};

const v$ = useVuelidate(rules, data);

watch(
  () => props.cuentaData,
  (newData) => {
    if (newData) {
      data.value.name = newData.name || "";
      data.value.account_type_id =
        props.tiposCuenta.find(
          (t) =>
            t.value ===
            (newData.account_type_id?.value || newData.account_type_id)
        ) || null;
      data.value.balance =
        newData.balance !== undefined && newData.balance !== null
          ? Number(newData.balance)
          : 0;
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
    account_type_id: data.value.account_type_id.value,
    balance: data.value.balance,
    currency: data.value.currency,
    description: data.value.description,
  };
  if (props.cuentaData && props.cuentaData.accountId) {
    payload.accountId = props.cuentaData.accountId;
  }
  emit("save", payload);
  closeModal();
};
</script>
