<script setup>
import {ref, defineProps, defineEmits, watch} from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  show: Boolean,
  ingresoToEdit: Object,
  cuentas: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

const nuevoIngreso = ref({
  id: null,
  descripcion: '',
  categoria: '',
  monto: null,
  fecha: new Date().toISOString().slice(0, 10),
});

const categorias = ref([
  'Salario',
  'Freelance',
  'Inversiones',
  'Ventas',
  'Regalías',
  'Bonos',
  'Regalos',
  'Otros'
]);

const isEditMode = ref(false);

const closeModal = () => {
  emit('close');
};

const saveIngreso = () => {
  if (!nuevoIngreso.value.descripcion || !nuevoIngreso.value.monto || !nuevoIngreso.value.categoria) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  emit('save', {...nuevoIngreso.value});
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.ingresoToEdit) {
      // Modo edición: cargar datos del ingreso existente
      nuevoIngreso.value = {...props.ingresoToEdit};
      isEditMode.value = true;
    } else {
      // Modo creación: resetear el formulario
      nuevoIngreso.value = {
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
            {{ isEditMode ? 'Editar Ingreso' : 'Agregar Nuevo Ingreso' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="saveIngreso">
          <div class="space-y-4">
            <div>
              <label for="descripcion-ingreso" class="block text-sm font-medium text-gray-700">Descripción</label>
              <InputText id="descripcion-ingreso" v-model="nuevoIngreso.descripcion" class="mt-1 block w-full"
                         required/>
            </div>
            <div>
              <label for="cuenta" class="block text-sm font-medium text-gray-700">Cuenta de Destino</label>
              <Dropdown id="cuenta" v-model="nuevoIngreso.cuentaId" :options="cuentas"
                        optionLabel="nombre" optionValue="id"
                        placeholder="Selecciona una cuenta" class="w-full mt-1" required/>
            </div>
            <div>
              <label for="monto-ingreso" class="block text-sm font-medium text-gray-700">Monto</label>
              <InputNumber id="monto-ingreso" v-model="nuevoIngreso.monto" inputId="currency-mx-ingreso"
                           mode="currency" currency="MXN" locale="es-MX" class="mt-1 block w-full" required/>
            </div>
            <div>
              <label for="fecha-ingreso" class="block text-sm font-medium text-gray-700">Fecha</label>
              <Calendar id="fecha-ingreso" v-model="nuevoIngreso.fecha" dateFormat="yy-mm-dd"
                        class="mt-1 block w-full" required/>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <Button type="button" label="Cancelar" severity="secondary" @click="closeModal"/>
            <Button type="submit" :label="isEditMode ? 'Actualizar' : 'Guardar'" severity="info"/>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>