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
        transaction: Object, // Cambié de transaccionToEdit a transaction para consistencia
        isEdit: Boolean,     // Agregué esta prop para saber si es edición
        accounts: Array,     // Cambié de cuentas a accounts para consistencia
        categories: Array    // Cambié de categorias a categories para consistencia
      });

      const emit = defineEmits(['update:visible', 'saved']);

      const localTransaccion = ref({});
      const submitted = ref(false);

      // Cuando el modal se abre, inicializa el formulario
      watch(() => props.visible, (isVisible) => {
        if (isVisible) {
          submitted.value = false;
          // Si se está editando, convierte la fecha a un objeto Date si es necesario
          if (props.transaction && props.isEdit) {
              // Manejar la fecha correctamente
              let fechaEdit = new Date();
              if (props.transaction.date) {
                  fechaEdit = new Date(props.transaction.date + 'T00:00:00');
              } else if (props.transaction.fecha) {
                  fechaEdit = new Date(props.transaction.fecha + 'T00:00:00');
              }
              
              localTransaccion.value = {
                  ...props.transaction,
                  fecha: fechaEdit,
                  // Mapear campos del backend al frontend
                  monto: Math.abs(parseFloat(props.transaction.amount || props.transaction.monto || 0)),
                  descripcion: props.transaction.description || props.transaction.descripcion || '',
                  cuentaId: parseInt(props.transaction.account_id || props.transaction.cuentaId),
                  categoria: parseInt(props.transaction.category_id || props.transaction.categoria)
              };
          } else {
              // Valores por defecto para una nueva transacción
              localTransaccion.value = {
                fecha: new Date(),
                monto: null,
                descripcion: '',
                categoria: null,
                cuentaId: cuentasDisponibles.value.length > 0 ? cuentasDisponibles.value[0].id : null
              };
          }
        }
      });

      // Categorías a mostrar (todas, ya que el backend maneja la lógica)
      const categoriasDisponibles = computed(() => {
        return props.categories || [];
      });

      // Filtrar solo cuentas de efectivo y banco
      const cuentasDisponibles = computed(() => {
        if (!props.accounts) return [];
        return props.accounts.filter(cuenta => {
          const tipo = cuenta.name?.toLowerCase() || cuenta.tipo?.toLowerCase() || '';
          return tipo.includes('efectivo') || tipo.includes('banco') || tipo.includes('cash') || tipo.includes('bank');
        });
      });

      // Función para formatear moneda
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }).format(value || 0);
      };

      // Función para obtener el saldo disponible de la cuenta seleccionada
      const getSaldoDisponible = () => {
        if (!localTransaccion.value.cuentaId) return 0;
        const cuenta = props.accounts?.find(c => c.id === localTransaccion.value.cuentaId);
        return cuenta?.balance || 0;
      };

      // Función para obtener el nombre de la cuenta seleccionada
      const getNombreCuentaSeleccionada = () => {
        if (!localTransaccion.value.cuentaId) return '';
        const cuenta = props.accounts?.find(c => c.id === localTransaccion.value.cuentaId);
        return cuenta?.name || '';
      };

      // Función para verificar si el monto excede el saldo disponible
      const isMontoExcedeSaldo = () => {
        if (!localTransaccion.value.monto || !localTransaccion.value.categoria || !localTransaccion.value.cuentaId) {
          return false;
        }
        
        const categoria = props.categories?.find(c => c.id === localTransaccion.value.categoria);
        const esGasto = categoria?.type === 'gasto' || categoria?.tipo === 'gasto';
        
        if (!esGasto) return false;
        
        const monto = parseFloat(localTransaccion.value.monto);
        const saldoDisponible = getSaldoDisponible();
        
        return monto > saldoDisponible;
      };

      const closeModal = () => {
        emit('update:visible', false);
      };

      const handleSave = () => {
        submitted.value = true;
        if (!localTransaccion.value.monto || !localTransaccion.value.descripcion || !localTransaccion.value.cuentaId || !localTransaccion.value.categoria) {
          return;
        }
        
        // Validaciones adicionales
        const monto = parseFloat(localTransaccion.value.monto);
        const cuentaId = parseInt(localTransaccion.value.cuentaId);
        const categoriaId = parseInt(localTransaccion.value.categoria);
        
        if (isNaN(monto) || monto <= 0) {
          console.error('Monto inválido:', monto);
          return;
        }
        
        if (isNaN(cuentaId)) {
          console.error('ID de cuenta inválido:', cuentaId);
          return;
        }
        
        if (isNaN(categoriaId)) {
          console.error('ID de categoría inválido:', categoriaId);
          return;
        }

        // Validar que el monto no exceda el saldo disponible para gastos
        if (isMontoExcedeSaldo()) {
          console.error('El monto excede el saldo disponible');
          return;
        }
        
        // Formatear fecha a YYYY-MM-DD antes de guardar
        let fechaFormateada = '';
        if (localTransaccion.value.fecha instanceof Date) {
            // Asegurar que la fecha sea válida
            if (!isNaN(localTransaccion.value.fecha.getTime())) {
                fechaFormateada = localTransaccion.value.fecha.toISOString().split('T')[0];
            } else {
                fechaFormateada = new Date().toISOString().split('T')[0];
            }
        } else if (localTransaccion.value.fecha) {
            // Si ya es un string, verificar que tenga el formato correcto
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(localTransaccion.value.fecha)) {
                fechaFormateada = localTransaccion.value.fecha;
            } else {
                fechaFormateada = new Date().toISOString().split('T')[0];
            }
        } else {
            // Si no hay fecha, usar la fecha actual
            fechaFormateada = new Date().toISOString().split('T')[0];
        }

        // Crear el objeto con la estructura requerida por el backend
        const transaccionData = {
          account_id: cuentaId,
          category_id: categoriaId,
          amount: monto,
          description: localTransaccion.value.descripcion.trim(),
          date: fechaFormateada,
          // Mantener id para edición
          id: localTransaccion.value.id
        };

        console.log('Datos a enviar:', transaccionData); // Para debug

        emit('saved', transaccionData);
        closeModal();
      };
      </script>

      <template>
        <Dialog :visible="visible" @update:visible="closeModal" modal :header="transaction ? 'Editar Transacción' : 'Nueva Transacción'" :style="{width: '500px'}" class="p-fluid">
          <div class="space-y-6 p-4">
            <!-- Card de saldo disponible -->
            <div v-if="localTransaccion.cuentaId" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <i class="pi pi-wallet text-blue-600 mr-2"></i>
                  <span class="text-sm font-medium text-blue-800">{{ getNombreCuentaSeleccionada() }}</span>
                </div>
                <div class="text-right">
                  <span class="text-sm text-blue-600">Saldo disponible:</span>
                  <div class="text-lg font-bold text-blue-800">{{ formatCurrency(getSaldoDisponible()) }}</div>
                </div>
              </div>
            </div>

            <!-- Fila 1: Cuenta -->
            <div>
              <label for="cuenta" class="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
              <Dropdown id="cuenta" v-model="localTransaccion.cuentaId" :options="cuentasDisponibles" optionLabel="name" optionValue="id" placeholder="Selecciona una cuenta" :class="{'p-invalid': submitted && !localTransaccion.cuentaId}"/>
              <small v-if="submitted && !localTransaccion.cuentaId" class="p-error">La cuenta es obligatoria.</small>
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
                <Dropdown id="categoria" v-model="localTransaccion.categoria" :options="categoriasDisponibles" optionLabel="name" optionValue="id" placeholder="Selecciona una categoría" :class="{'p-invalid': submitted && !localTransaccion.categoria}"/>
                <small v-if="submitted && !localTransaccion.categoria" class="p-error">La categoría es obligatoria.</small>
              </div>
              <div>
                <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <InputNumber id="monto" v-model="localTransaccion.monto" mode="currency" currency="MXN" locale="es-MX" :class="{'p-invalid': submitted && (!localTransaccion.monto || isMontoExcedeSaldo())}"/>
                <small v-if="submitted && !localTransaccion.monto" class="p-error">El monto es obligatorio.</small>
                <small v-if="submitted && isMontoExcedeSaldo()" class="p-error">
                  El monto excede el saldo disponible ({{ formatCurrency(getSaldoDisponible()) }})
                </small>
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