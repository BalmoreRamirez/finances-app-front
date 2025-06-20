<script setup>
import {ref, defineProps, defineEmits, watch} from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  show: Boolean,
  gastoToEdit: Object
});

const emit = defineEmits(['close', 'save']);

const nuevoGasto = ref({
  id: null,
  descripcion: '',
  categoria: '',
  monto: null,
  fecha: new Date().toISOString().slice(0, 10),
});

const categorias = ref([
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Servicios',
  'Ocio',
  'Salud',
  'Educación',
  'Otros'
]);

const isEditMode = ref(false);

const closeModal = () => {
  emit('close');
};

const saveGasto = () => {
  if (!nuevoGasto.value.descripcion || !nuevoGasto.value.monto || !nuevoGasto.value.categoria) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  emit('save', {...nuevoGasto.value});
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.gastoToEdit) {
      // Modo edición
      nuevoGasto.value = {...props.gastoToEdit};
      isEditMode.value = true;
    } else {
      // Modo creación
      nuevoGasto.value = {
        id: null,
        descripcion: '',
        categoria: '',
        monto: null,
        fecha: new Date().toISOString().slice(0, 10),
      };
      isEditMode.value = false;
    }
  }
});
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center pb-3">
          <h3 class="text-xl font-semibold text-gray-800">
            {{ isEditMode ? 'Editar Gasto' : 'Agregar Nuevo Gasto' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="saveGasto">
          <div class="space-y-4">
            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
              <InputText id="descripcion" v-model="nuevoGasto.descripcion" class="mt-1 block w-full" required/>
            </div>
            <div>
              <label for="categoria" class="block text-sm font-medium text-gray-700">Categoría</label>
              <Dropdown id="categoria" v-model="nuevoGasto.categoria" :options="categorias"
                        placeholder="Selecciona una Categoría" class="w-full mt-1" required/>
            </div>
            <div>
              <label for="monto" class="block text-sm font-medium text-gray-700">Monto</label>
              <InputNumber id="monto" v-model="nuevoGasto.monto" inputId="currency-mx" mode="currency" currency="MXN"
                           locale="es-MX" class="mt-1 block w-full" required/>
            </div>
            <div>
              <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha</label>
              <Calendar id="fecha" v-model="nuevoGasto.fecha" dateFormat="yy-mm-dd" class="mt-1 block w-full"
                        required/>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <Button type="button" label="Cancelar" severity="secondary" @click="closeModal"/>
            <Button type="submit" :label="isEditMode ? 'Actualizar' : 'Guardar'" severity="danger"/>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>