<template>
  <Dialog
    :visible="visible"
    @update:visible="closeModal"
    modal
    :header="headerText"
    :style="{ width: '450px' }"
    class="p-fluid"
  >
    <div class="space-y-6 p-4">
      <div>
        <Input
          v-model="v$.accountName.$model"
          :errors="v$.accountName.$errors"
          placeholder="Nombre de la cuenta*"
          class="w-full"
        />
      </div>

      <div>
        <Select
          v-model="v$.accountTypeId.$model"
          :items="props.tiposCuenta"
          :errors="v$.accountTypeId.$errors"
          optionLabel="nombre"
          placeholder="Selecciona un tipo*"
          class="w-full"
        />
      </div>

      <div>
        <Number
          v-model="v$.balance.$model"
          :errors="v$.balance.$errors"
          placeholder="Saldo de la cuenta*"
          class="w-full"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="closeModal" />
      <Button label="Guardar" icon="pi pi-check" @click="saveCuenta" />
    </template>
  </Dialog>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";

const props = defineProps({
  visible: Boolean,
  isEditMode: Boolean,
  cuentaData: Object,
  tiposCuenta: Array,
});

const emit = defineEmits(["update:visible", "save"]);

const localCuenta = ref({});
const submitted = ref(false);

watch(
  () => props.cuentaData,
  (newData) => {
    if (newData) {
      data.value.accountName = newData.accountName || "";
      // Buscar el objeto tipo de cuenta completo si es un id
      if (typeof newData.accountTypeId === 'object') {
        data.value.accountTypeId = newData.accountTypeId;
      } else if (newData.accountTypeId) {
        data.value.accountTypeId = props.tiposCuenta.find(tc => tc.value === newData.accountTypeId) || null;
      } else {
        data.value.accountTypeId = null;
      }
      data.value.balance = newData.balance || 0;
    }
  },
  { deep: true, immediate: true }
);

const closeModal = () => {
  emit("update:visible", false);
  submitted.value = false;
};
const data = ref({
  accountName: "",
  accountTypeId: null,
  balance: 0,
});
const rules = {
  accountName: {
    required: helpers.withMessage("El nombre es obligatorio.", required),
  },
  accountTypeId: {
    required: helpers.withMessage(
      "El tipo de cuenta es obligatorio.",
      required
    ),
  },
  balance: {
    required: helpers.withMessage("El saldo es obligatorio.", required),
  },
};
const v$ = useVuelidate(rules, data);

const saveCuenta = () => {
  submitted.value = true;
  if (v$.value.$invalid) {
    v$.value.$touch();
    return;
  }
  const payload = {
    accountName: data.value.accountName,
    accountTypeId: data.value.accountTypeId.value,
    balance: data.value.balance,
  };
  // Si estamos editando, incluir el id
  if (props.cuentaData && props.cuentaData.accountId) {
    payload.accountId = props.cuentaData.accountId;
  }
  emit("save", payload);
  closeModal();
};

const headerText = computed(() =>
  props.isEditMode ? "Editar Cuenta" : "Nueva Cuenta"
);
</script>
