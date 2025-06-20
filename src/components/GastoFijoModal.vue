<script setup>
import { ref, watch, computed } from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  visible: Boolean,
  gastoFijoToEdit: Object
});

const emit = defineEmits(['update:visible', 'save']);

const gastoFijoData = ref({});
const isEditMode = computed(() => gastoFijoData.value && gastoFijoData.value.id);

const categorias = ref([
  'Vivienda', 'Alimentación', 'Transporte', 'Servicios',
  'Entretenimiento', 'Salud', 'Educación', 'Varios'
]);

const diasDelMes = Array.from({length: 31}, (_, i) => i + 1);

watch(() => props.visible, (newVal) => {
  if (newVal) {
    gastoFijoData.value = {...props.gastoFijoToEdit};
  }
});

const closeModal = () => {
  emit('update:visible', false);
};

const saveGastoFijo = () => {
  if (!gastoFijoData.value.descripcion || !gastoFijoData.value.monto ||
      !gastoFijoData.value.categoria || !gastoFijoData.value.diaPago) {
    alert('Por favor, completa todos los campos requeridos.');
    return;
  }
  emit('save', gastoFijoData.value);
  closeModal();
};
</script>

<template>
  <div v-if="props.visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center pb-3 border-b">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ isEditMode ? 'Editar Gasto Fijo' : 'Agregar Nuevo Gasto Fijo' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="saveGastoFijo" class="pt-4">
          <div class="space-y-4">
            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
              <InputText id="descripcion" v-model="gastoFijoData.descripcion" class="mt-1 block w-full" required/>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="monto" class="block text-sm font-medium text-gray-700">Monto Mensual</label>
                <InputNumber id="monto" v-model="gastoFijoData.monto" inputId="currency-mx" mode="currency"
                             currency="MXN" locale="es-MX" class="mt-1 w-full" required/>
              </div>
              <div>
                <label for="categoria" class="block text-sm font-medium text-gray-700">Categoría</label>
                <Dropdown id="categoria" v-model="gastoFijoData.categoria" :options="categorias"
                          placeholder="Selecciona" class="w-full mt-1" required/>
              </div>
            </div>

            <div>
              <label for="diaPago" class="block text-sm font-medium text-gray-700">Día de pago mensual</label>
              <Dropdown id="diaPago" v-model="gastoFijoData.diaPago" :options="diasDelMes"
                        placeholder="Selecciona el día" class="w-full mt-1" required/>
            </div>
          </div>
          <div class="mt-8 flex justify-end space-x-3">
            <Button type="button" label="Cancelar" severity="secondary" @click="closeModal"/>
            <Button type="submit" :label="isEditMode ? 'Actualizar' : 'Guardar'" severity="success"/>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>