<script setup>
    import {ref, watch, computed} from 'vue';
    import Dialog from 'primevue/dialog';
    import InputText from 'primevue/inputtext';
    import InputNumber from 'primevue/inputnumber';
    import Dropdown from 'primevue/dropdown';
    import Button from 'primevue/button';

    const props = defineProps({
      visible: Boolean,
      isEditMode: Boolean,
      cuentaData: Object,
      tiposCuenta: Array
    });

    const emit = defineEmits(['update:visible', 'save']);

    const localCuenta = ref({});
    const submitted = ref(false);

    watch(() => props.cuentaData, (newData) => {
      if (newData) {
        localCuenta.value = {...newData};
      }
    }, {deep: true});

    const closeModal = () => {
      emit('update:visible', false);
      submitted.value = false;
    };

    const saveCuenta = () => {
      submitted.value = true;
      if (!localCuenta.value.nombre || !localCuenta.value.tipo) {
        return;
      }
      emit('save', localCuenta.value);
      closeModal();
    };

    const headerText = computed(() => props.isEditMode ? 'Editar Cuenta' : 'Nueva Cuenta');
    </script>

    <template>
      <Dialog :visible="visible" @update:visible="closeModal" modal :header="headerText" :style="{ width: '450px' }"
              class="p-fluid">
        <div class="space-y-6 p-4">
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cuenta</label>
            <InputText id="nombre" v-model.trim="localCuenta.nombre" required
                       :class="{'p-invalid': submitted && !localCuenta.nombre}"/>
            <small v-if="submitted && !localCuenta.nombre" class="p-error">El nombre es obligatorio.</small>
          </div>

          <div>
            <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
            <Dropdown id="tipo" v-model="localCuenta.tipo" :options="props.tiposCuenta" optionLabel="label"
                      optionValue="value" placeholder="Selecciona un tipo"
                      :class="{'p-invalid': submitted && !localCuenta.tipo}"/>
            <small v-if="submitted && !localCuenta.tipo" class="p-error">El tipo es obligatorio.</small>
          </div>

          <div>
            <label for="saldo" class="block text-sm font-medium text-gray-700 mb-1">Saldo</label>
            <InputNumber id="saldo" v-model="localCuenta.saldo" mode="currency" currency="MXN" locale="es-MX"/>
          </div>
        </div>
        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" text @click="closeModal"/>
          <Button label="Guardar" icon="pi pi-check" @click="saveCuenta"/>
        </template>
      </Dialog>
    </template>