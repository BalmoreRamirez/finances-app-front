<script setup>
  import {ref, defineProps, defineEmits, watch, computed} from 'vue';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';

  const props = defineProps({
    visible: Boolean,
    isEditMode: Boolean,
    inversionData: Object
  });

  const emit = defineEmits(['update:visible', 'save']);

  const getInitialInversion = () => ({
    id: null,
    tipo: 'credito', // Tipo por defecto
    descripcion: '',
    montoInvertido: null,
    montoRetorno: null,
    beneficiario: '',
    interes: 10,
    numeroCuotas: 2,
    fechaInversion: new Date().toISOString().slice(0, 10),
    fechaRetorno: null,
    fechaVencimiento: null,
    estado: 'activa',
    cuotas: [],
    cuentaId: null,
  });

  const nuevaInversion = ref(getInitialInversion());

  const tipos = ref([
    {name: 'Crédito', value: 'credito'},
    {name: 'Compra-Venta', value: 'compraventa'}
  ]);

  const estados = ref([
    {name: 'Activa', value: 'activa'},
    {name: 'Finalizada', value: 'finalizada'},
    {name: 'Pagada', value: 'pagada'}
  ]);

  const opcionesCuotas = ref([
    {name: '1 cuota', value: 1}, {name: '2 cuotas', value: 2},
    {name: '3 cuotas', value: 3}, {name: '4 cuotas', value: 4},
    {name: '6 cuotas', value: 6}, {name: '12 cuotas', value: 12},
  ]);

  const ganancia = computed(() => {
    if (nuevaInversion.value.tipo === 'compraventa' && nuevaInversion.value.montoInvertido && nuevaInversion.value.montoRetorno) {
      return nuevaInversion.value.montoRetorno - nuevaInversion.value.montoInvertido;
    } else if (nuevaInversion.value.tipo === 'credito' && nuevaInversion.value.montoInvertido) {
      return nuevaInversion.value.montoInvertido * (nuevaInversion.value.interes / 100);
    }
    return 0;
  });

  const montoTotal = computed(() => {
    if (nuevaInversion.value.tipo === 'credito' && nuevaInversion.value.montoInvertido) {
      return nuevaInversion.value.montoInvertido * (1 + nuevaInversion.value.interes / 100);
    }
    return 0;
  });

  const montoPorCuota = computed(() => {
    if (nuevaInversion.value.tipo === 'credito' && montoTotal.value && nuevaInversion.value.numeroCuotas) {
      return montoTotal.value / nuevaInversion.value.numeroCuotas;
    }
    return 0;
  });

  watch(() => [nuevaInversion.value.fechaInversion, nuevaInversion.value.numeroCuotas], () => {
    if (nuevaInversion.value.fechaInversion && nuevaInversion.value.tipo === 'credito') {
      const fechaBase = new Date(nuevaInversion.value.fechaInversion);
      if (isNaN(fechaBase.getTime())) {
        nuevaInversion.value.fechaVencimiento = null;
        return;
      }
      fechaBase.setMonth(fechaBase.getMonth() + nuevaInversion.value.numeroCuotas);
      nuevaInversion.value.fechaVencimiento = fechaBase.toISOString().split('T')[0];
    }
  }, {immediate: true});

  const closeModal = () => {
    emit('update:visible', false);
  };

  const saveInversion = () => {
    if (!nuevaInversion.value.descripcion || !nuevaInversion.value.montoInvertido) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    const inversionData = {...nuevaInversion.value};
    if (inversionData.tipo === 'credito') {
      inversionData.ganancia = ganancia.value;
      inversionData.montoTotal = montoTotal.value;
    } else if (inversionData.tipo === 'compraventa' && inversionData.montoRetorno) {
      inversionData.ganancia = ganancia.value;
    }
    emit('save', inversionData);
  };

  watch(() => props.visible, (newVal) => {
    if (newVal) {
      nuevaInversion.value = {
        ...getInitialInversion(),
        ...props.inversionData
      };
    }
  });
  </script>

  <template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
         @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ isEditMode ? 'Editar Inversión' : 'Registrar Nueva Inversión' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <span class="material-icons">close</span>
            </button>
          </div>
          <form @submit.prevent="saveInversion" class="pt-4">
            <div class="space-y-6">
              <!-- SECCIÓN: INFORMACIÓN GENERAL -->
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="tipo" class="block text-sm font-medium text-gray-700">Tipo de Inversión</label>
                    <!-- CORRECCIÓN: v-model ahora apunta a 'tipo' y optionValue a 'value' -->
                    <Dropdown id="tipo" v-model="nuevaInversion.tipo" :options="tipos" optionLabel="name"
                              optionValue="value" placeholder="Selecciona el tipo" class="w-full mt-1" required/>
                  </div>
                  <div v-if="nuevaInversion.tipo === 'credito'">
                    <label for="beneficiario" class="block text-sm font-medium text-gray-700">Beneficiario</label>
                    <InputText id="beneficiario" v-model="nuevaInversion.beneficiario" class="mt-1 block w-full"
                               required/>
                  </div>
                </div>
                <div>
                  <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
                  <InputText id="descripcion" v-model="nuevaInversion.descripcion" class="mt-1 block w-full" required/>
                </div>
              </div>

              <hr/>

              <!-- SECCIÓN: DETALLES FINANCIEROS (CONDICIONAL) -->
              <!-- Caso: Crédito -->
              <div v-if="nuevaInversion.tipo === 'credito'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="montoInvertido" class="block text-sm font-medium text-gray-700">Monto del Crédito</label>
                    <InputNumber id="montoInvertido" v-model="nuevaInversion.montoInvertido" mode="currency"
                                 currency="MXN" locale="es-MX" class="mt-1 w-full" required/>
                  </div>
                  <div>
                    <label for="interes" class="block text-sm font-medium text-gray-700">Interés (%)</label>
                    <InputNumber id="interes" v-model="nuevaInversion.interes" suffix="%" class="mt-1 w-full" :min="0"/>
                  </div>
                  <div v-if="!isEditMode">
                    <label for="numeroCuotas" class="block text-sm font-medium text-gray-700">Número de Cuotas</label>
                    <Dropdown id="numeroCuotas" v-model="nuevaInversion.numeroCuotas" :options="opcionesCuotas"
                              optionLabel="name" optionValue="value" class="w-full mt-1"/>
                  </div>
                </div>
                <div class="bg-blue-50 p-3 rounded-md space-y-1 text-sm text-blue-800">
                  <p>Monto total a recibir: <strong>{{ new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(montoTotal) }}</strong></p>
                  <p>Ganancia estimada: <strong>{{ new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(ganancia) }}</strong></p>
                  <p v-if="nuevaInversion.numeroCuotas > 1">Cuota mensual: <strong>{{ new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(montoPorCuota) }}</strong></p>
                </div>
              </div>

              <!-- Caso: Compra-Venta -->
              <div v-if="nuevaInversion.tipo === 'compraventa'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="montoInvertidoCV" class="block text-sm font-medium text-gray-700">Monto Invertido</label>
                    <InputNumber id="montoInvertidoCV" v-model="nuevaInversion.montoInvertido" mode="currency"
                                 currency="MXN" locale="es-MX" class="mt-1 w-full" required/>
                  </div>
                  <div>
                    <label for="montoRetorno" class="block text-sm font-medium text-gray-700">Monto de Venta/Retorno</label>
                    <InputNumber id="montoRetorno" v-model="nuevaInversion.montoRetorno" mode="currency" currency="MXN"
                                 locale="es-MX" class="mt-1 w-full"/>
                  </div>
                </div>
                <div v-if="ganancia" class="bg-green-50 p-3 rounded-md text-sm text-green-800">
                  <p>Ganancia: <strong>{{ new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(ganancia) }}</strong></p>
                </div>
              </div>

              <hr/>

              <!-- SECCIÓN: FECHAS -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="fechaInversion" class="block text-sm font-medium text-gray-700">{{ nuevaInversion.tipo === 'credito' ? 'Fecha del Préstamo' : 'Fecha de Inversión' }}</label>
                  <Calendar id="fechaInversion" v-model="nuevaInversion.fechaInversion" dateFormat="yy-mm-dd" class="mt-1 w-full" required/>
                </div>
                <div v-if="nuevaInversion.tipo === 'credito'">
                  <label for="fechaVencimiento" class="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                  <Calendar id="fechaVencimiento" v-model="nuevaInversion.fechaVencimiento" dateFormat="yy-mm-dd" class="mt-1 w-full" required :disabled="!isEditMode"/>
                </div>
                <div v-if="nuevaInversion.tipo === 'compraventa' && isEditMode">
                  <label for="fechaRetorno" class="block text-sm font-medium text-gray-700">Fecha de Venta/Retorno</label>
                  <Calendar id="fechaRetorno" v-model="nuevaInversion.fechaRetorno" dateFormat="yy-mm-dd" class="mt-1 w-full"/>
                </div>
              </div>

              <!-- SECCIÓN: ESTADO (SOLO EDICIÓN) -->
              <div v-if="isEditMode" class="pt-4 border-t">
                <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
                <Dropdown id="estado" v-model="nuevaInversion.estado" :options="estados" optionLabel="name" optionValue="value" class="w-full mt-1" required/>
              </div>
            </div>

            <!-- BOTONES DE ACCIÓN -->
            <div class="mt-8 flex justify-end space-x-3">
              <Button type="button" label="Cancelar" severity="secondary" @click="closeModal"/>
              <Button type="submit" :label="isEditMode ? 'Actualizar' : 'Guardar'" severity="success"/>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>