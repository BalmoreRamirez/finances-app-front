<script setup>
      import {ref, watch, computed} from 'vue';
      import Dialog from 'primevue/dialog';
      import Dropdown from 'primevue/dropdown';
      import InputText from 'primevue/inputtext';
      import InputNumber from 'primevue/inputnumber';
      import Calendar from 'primevue/calendar';
      import Button from 'primevue/button';

      const props = defineProps({
        visible: Boolean,
        transaccionToEdit: Object,
        cuentas: Array,
        categorias: Object // Prop para recibir las categorías
      });

      const emit = defineEmits(['update:visible', 'save']);

      const localTransaccion = ref({});
      const submitted = ref(false);

      const tipos = ref([
        {label: 'Ingreso', value: 'ingreso'},
        {label: 'Gasto', value: 'gasto'}
      ]);

      // Cuando el modal se abre, inicializa el formulario
      watch(() => props.visible, (isVisible) => {
        if (isVisible) {
          submitted.value = false;
          // Si se está editando, convierte la fecha a un objeto Date si es necesario
          if (props.transaccionToEdit) {
              localTransaccion.value = {
                  ...props.transaccionToEdit,
                  fecha: new Date(props.transaccionToEdit.fecha + 'T00:00:00')
              };
          } else {
              // Valores por defecto para una nueva transacción
              localTransaccion.value = {
                tipo: 'gasto',
                fecha: new Date(),
                monto: null,
                descripcion: '',
                categoria: null,
                cuentaId: props.cuentas.length > 0 ? props.cuentas[0].id : null
              };
          }
        }
      });

      // Categorías a mostrar según el tipo seleccionado
      const categoriasDisponibles = computed(() => {
        if (!props.categorias || !localTransaccion.value.tipo) return [];
        return props.categorias[localTransaccion.value.tipo] || [];
      });

      const closeModal = () => {
        emit('update:visible', false);
      };

      const handleSave = () => {
        submitted.value = true;
        if (!localTransaccion.value.monto || !localTransaccion.value.descripcion || !localTransaccion.value.cuentaId) {
          return;
        }
        // Formatear fecha a YYYY-MM-DD antes de guardar
        if (localTransaccion.value.fecha instanceof Date) {
            localTransaccion.value.fecha = localTransaccion.value.fecha.toISOString().split('T')[0];
        }
        emit('save', localTransaccion.value);
        closeModal();
      };
      </script>

      <template>
        <Dialog :visible="visible" @update:visible="closeModal" modal :header="transaccionToEdit ? 'Editar Transacción' : 'Nueva Transacción'" :style="{width: '500px'}" class="p-fluid">
          <div class="space-y-6 p-4">
            <!-- Fila 1: Tipo y Cuenta -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <Dropdown id="tipo" v-model="localTransaccion.tipo" :options="tipos" optionLabel="label" optionValue="value"/>
              </div>
              <div>
                <label for="cuenta" class="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                <Dropdown id="cuenta" v-model="localTransaccion.cuentaId" :options="cuentas" optionLabel="nombre" optionValue="id" placeholder="Selecciona una cuenta" :class="{'p-invalid': submitted && !localTransaccion.cuentaId}"/>
                <small v-if="submitted && !localTransaccion.cuentaId" class="p-error">La cuenta es obligatoria.</small>
              </div>
            </div>

            <!-- Fila 2: Descripción -->
            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <InputText id="descripcion" v-model.trim="localTransaccion.descripcion" :class="{'p-invalid': submitted && !localTransaccion.descripcion}"/>
              <small v-if="submitted && !localTransaccion.descripcion" class="p-error">La descripción es obligatoria.</small>
            </div>

            <!-- Fila 3: Categoría y Monto -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <Dropdown id="categoria" v-model="localTransaccion.categoria" :options="categoriasDisponibles" optionLabel="label" optionValue="value" placeholder="Selecciona una categoría"/>
              </div>
              <div>
                <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <InputNumber id="monto" v-model="localTransaccion.monto" mode="currency" currency="MXN" locale="es-MX" :class="{'p-invalid': submitted && !localTransaccion.monto}"/>
                <small v-if="submitted && !localTransaccion.monto" class="p-error">El monto es obligatorio.</small>
              </div>
            </div>

            <!-- Fila 4: Fecha -->
            <div>
              <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <Calendar id="fecha" v-model="localTransaccion.fecha" dateFormat="dd/mm/yy" showIcon/>
            </div>
          </div>
          <template #footer>
            <Button label="Cancelar" icon="pi pi-times" text @click="closeModal"/>
            <Button label="Guardar" icon="pi pi-check" @click="handleSave"/>
          </template>
        </Dialog>
      </template>