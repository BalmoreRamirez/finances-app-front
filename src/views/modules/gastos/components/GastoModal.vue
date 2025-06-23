<script setup>
import {ref, watch, computed, defineProps, defineEmits} from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

// CORRECCIÓN: Props actualizadas para v-model y para recibir las cuentas
const props = defineProps({
  visible: Boolean,
  gastoToEdit: Object,
  cuentas: {
    type: Array,
    default: () => []
  }
});

// CORRECCIÓN: Emits actualizados para v-model
const emit = defineEmits(['update:visible', 'save']);

const gastoData = ref({});

const isEditMode = computed(() => gastoData.value && gastoData.value.id);

const categorias = ref([
  'Vivienda', 'Alimentación', 'Transporte', 'Servicios',
  'Entretenimiento', 'Salud', 'Educación', 'Varios'
]);

// CORRECCIÓN: El watch ahora reacciona a la visibilidad para inicializar los datos
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // Copia los datos del prop al estado local cuando se abre el modal
    gastoData.value = {...props.gastoToEdit};
  }
});

const closeModal = () => {
  emit('update:visible', false);
};

const saveGasto = () => {
  if (!gastoData.value.descripcion || !gastoData.value.monto || !gastoData.value.categoria || !gastoData.value.cuentaId) {
    alert('Por favor, completa todos los campos requeridos.');
    return;
  }
  emit('save', gastoData.value);
  closeModal(); // Cierra el modal después de guardar
};
</script>

<template>
  <!-- CORRECCIÓN: Se usa props.visible para controlar la visibilidad -->
  <div v-if="props.visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center pb-3 border-b">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ isEditMode ? 'Editar Gasto' : 'Agregar Nuevo Gasto' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="saveGasto" class="pt-4">
          <div class="space-y-4">
            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
              <InputText id="descripcion" v-model="gastoData.descripcion" class="mt-1 block w-full" required/>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="monto" class="block text-sm font-medium text-gray-700">Monto</label>
                <InputNumber id="monto" v-model="gastoData.monto" inputId="currency-mx" mode="currency" currency="MXN"
                             locale="es-MX" class="mt-1 w-full" required/>
              </div>
              <div>
                <label for="categoria" class="block text-sm font-medium text-gray-700">Categoría</label>
                <Dropdown id="categoria" v-model="gastoData.categoria" :options="categorias"
                          placeholder="Selecciona" class="w-full mt-1" required/>
              </div>
            </div>

            <!-- NUEVO: Campo para seleccionar la cuenta -->
            <div>
              <label for="cuenta" class="block text-sm font-medium text-gray-700">Cuenta de Origen</label>
              <Dropdown id="cuenta" v-model="gastoData.cuentaId" :options="props.cuentas"
                        optionLabel="nombre" optionValue="id"
                        placeholder="Selecciona una cuenta" class="w-full mt-1" required/>
            </div>

            <div>
              <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha del Gasto</label>
              <Calendar id="fecha" v-model="gastoData.fecha" dateFormat="yy-mm-dd" class="mt-1 block w-full"
                        required/>
            </div>
          </div>
          <div class="mt-8 flex justify-end space-x-3">
            <Button type="button" label="Cancelar" severity="secondary" @click="closeModal"/>
            <Button type="submit" :label="isEditMode ? 'Actualizar' : 'Guardar'" severity="danger"/>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>