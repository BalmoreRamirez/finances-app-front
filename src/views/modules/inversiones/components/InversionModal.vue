<script setup>
          import { ref, watch, computed } from 'vue';
          import { storeToRefs } from 'pinia';
          import { useFinanceStore } from '../../../../stores/financeStore.js';

          // Componentes de PrimeVue
          import Dialog from 'primevue/dialog';
          import Dropdown from 'primevue/dropdown';
          import InputText from 'primevue/inputtext';
          import InputNumber from 'primevue/inputnumber';
          import Calendar from 'primevue/calendar';
          import Button from 'primevue/button';

          // Props y Emits
          const props = defineProps({
            visible: Boolean,
            isEditMode: Boolean,
            inversionData: Object
          });
          const emit = defineEmits(['update:visible', 'save']);

          // Store
          const store = useFinanceStore();
          const { cuentas } = storeToRefs(store);

          // State local
          const localInversion = ref({});
          const submitted = ref(false);

          const tiposInversion = ref([
            { label: 'Crédito', value: 'credito' },
            { label: 'Compra-Venta', value: 'compraventa' }
          ]);

          watch(() => props.inversionData, (newData) => {
            if (newData) {
              localInversion.value = { ...newData };
              if (typeof newData.fechaInversion === 'string') {
                localInversion.value.fechaInversion = new Date(newData.fechaInversion + 'T00:00:00');
              }
              if (typeof newData.fechaVencimiento === 'string' && newData.fechaVencimiento) {
                localInversion.value.fechaVencimiento = new Date(newData.fechaVencimiento + 'T00:00:00');
              }
            }
          }, { deep: true });

          // Propiedades computadas para cálculos automáticos
          const gananciaCalculada = computed(() => {
            const inv = localInversion.value;
            if (!inv.montoInvertido || inv.montoInvertido <= 0) return 0;

            if (inv.tipo === 'credito') {
              return inv.montoInvertido * ((inv.interes || 0) / 100);
            }
            if (inv.tipo === 'compraventa') {
              return inv.montoInvertido * ((inv.margenGanancia || 0) / 100);
            }
            return inv.ganancia || 0;
          });

          const montoTotalCalculado = computed(() => {
            return (localInversion.value.montoInvertido || 0) + gananciaCalculada.value;
          });

          watch([gananciaCalculada, montoTotalCalculado], ([newGanancia, newMontoTotal]) => {
            localInversion.value.ganancia = newGanancia;
            localInversion.value.montoTotal = newMontoTotal;
          });

          // Métodos
          const formatCurrency = (value) => {
            if (typeof value !== 'number') return '$0.00';
            return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
          };

          const closeModal = () => {
            emit('update:visible', false);
            submitted.value = false;
          };

          const saveInversion = () => {
            submitted.value = true;
            if (!localInversion.value.descripcion || !localInversion.value.cuentaId || !(localInversion.value.montoInvertido > 0)) {
              return;
            }
            if (localInversion.value.fechaInversion instanceof Date) {
              localInversion.value.fechaInversion = localInversion.value.fechaInversion.toISOString().split('T')[0];
            }
            if (localInversion.value.fechaVencimiento instanceof Date) {
              localInversion.value.fechaVencimiento = localInversion.value.fechaVencimiento.toISOString().split('T')[0];
            }
            emit('save', localInversion.value);
            closeModal();
          };
          </script>

          <template>
            <Dialog :visible="props.visible" :style="{ width: '650px' }" :header="props.isEditMode ? 'Editar Inversión' : 'Registrar Inversión'" modal class="p-fluid" @update:visible="closeModal">
              <div class="space-y-6 p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Inversión</label>
                    <Dropdown id="tipo" v-model="localInversion.tipo" :options="tiposInversion" optionLabel="label" optionValue="value" placeholder="Selecciona un tipo"/>
                  </div>
                  <div>
                    <label for="cuentaId" class="block text-sm font-medium text-gray-700 mb-1">Cuenta de Origen</label>
                    <Dropdown id="cuentaId" v-model="localInversion.cuentaId" :options="cuentas" optionLabel="nombre" optionValue="id" placeholder="Selecciona una cuenta" :class="{'p-invalid': submitted && !localInversion.cuentaId}"/>
                    <small v-if="submitted && !localInversion.cuentaId" class="p-error">La cuenta es obligatoria.</small>
                  </div>
                </div>

                <div>
                  <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <InputText id="descripcion" v-model.trim="localInversion.descripcion" required :class="{'p-invalid': submitted && !localInversion.descripcion}"/>
                  <small v-if="submitted && !localInversion.descripcion" class="p-error">La descripción es obligatoria.</small>
                </div>

                <div v-if="localInversion.tipo === 'credito'">
                  <label for="beneficiario" class="block text-sm font-medium text-gray-700 mb-1">Beneficiario (Prestatario)</label>
                  <InputText id="beneficiario" v-model.trim="localInversion.beneficiario"/>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="montoInvertido" class="block text-sm font-medium text-gray-700 mb-1">Monto Invertido / Costo</label>
                    <InputNumber id="montoInvertido" v-model="localInversion.montoInvertido" mode="currency" currency="MXN" locale="es-MX" required :class="{'p-invalid': submitted && !(localInversion.montoInvertido > 0)}"/>
                    <small v-if="submitted && !(localInversion.montoInvertido > 0)" class="p-error">El monto debe ser positivo.</small>
                  </div>
                  <div v-if="localInversion.tipo === 'credito'">
                    <label for="interes" class="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés (%)</label>
                    <InputNumber id="interes" v-model="localInversion.interes" suffix=" %" :min="0"/>
                  </div>
                  <div v-if="localInversion.tipo === 'compraventa'">
                    <label for="margenGanancia" class="block text-sm font-medium text-gray-700 mb-1">Margen de Ganancia (%)</label>
                    <InputNumber id="margenGanancia" v-model="localInversion.margenGanancia" suffix=" %" :min="0"/>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                  <div>
                    <p class="text-sm text-gray-500">Ganancia Estimada</p>
                    <p class="font-semibold text-green-600">{{ formatCurrency(gananciaCalculada) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Monto Total a Recibir / Venta</p>
                    <p class="font-semibold text-blue-600">{{ formatCurrency(montoTotalCalculado) }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="fechaInversion" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inversión / Compra</label>
                    <Calendar id="fechaInversion" v-model="localInversion.fechaInversion" dateFormat="dd/mm/yy" showIcon/>
                  </div>
                  <div>
                    <label for="fechaVencimiento" class="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento / Venta</label>
                    <Calendar id="fechaVencimiento" v-model="localInversion.fechaVencimiento" dateFormat="dd/mm/yy" showIcon/>
                  </div>
                </div>
              </div>

              <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="closeModal"/>
                <Button label="Guardar" icon="pi pi-check" @click="saveInversion"/>
              </template>
            </Dialog>
          </template>