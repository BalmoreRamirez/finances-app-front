<script setup>
    import { ref, watch, computed } from 'vue';
    import Button from 'primevue/button';
    import Dialog from 'primevue/dialog';
    import InputText from 'primevue/inputtext';
    import InputNumber from 'primevue/inputnumber';

    const props = defineProps({
      visible: {
        type: Boolean,
        required: true,
      },
      isEditMode: {
        type: Boolean,
        default: false,
      },
      cuentaData: {
        type: Object,
        default: () => ({ id: null, nombre: '', saldo: 0 }),
      },
    });

    const emit = defineEmits(['update:visible', 'save']);

    const localCuenta = ref({});

    // Sincroniza el estado local con las props cuando se abre el modal
    watch(() => props.cuentaData, (newData) => {
      localCuenta.value = { ...newData };
    }, { deep: true });

    const showModal = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value),
    });

    const save = () => {
      emit('save', localCuenta.value);
      showModal.value = false;
    };

    const cancel = () => {
      showModal.value = false;
    };
    </script>

    <template>
      <Dialog v-model:visible="showModal" :header="isEditMode ? 'Editar Cuenta' : 'Nueva Cuenta'" :modal="true" class="w-full max-w-md">
        <div class="space-y-4 p-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre de la Cuenta</label>
            <InputText id="nombre" v-model="localCuenta.nombre" class="mt-1 w-full" placeholder="Ej: Ahorros" />
          </div>
          <div>
            <label for="saldo" class="block text-sm font-medium text-gray-700">Saldo Inicial</label>
            <InputNumber id="saldo" v-model="localCuenta.saldo" class="mt-1 w-full" mode="currency" currency="MXN" locale="es-MX" :disabled="isEditMode" />
            <small v-if="isEditMode" class="text-xs text-gray-500">El saldo solo se puede modificar a través de transacciones.</small>
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancel" />
          <Button :label="isEditMode ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="save" />
        </template>
      </Dialog>
    </template>