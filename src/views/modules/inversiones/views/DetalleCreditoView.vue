<script setup>
    import {ref, computed} from 'vue';
    import {useRoute, useRouter} from 'vue-router';
    import {useFinanceStore} from '../../../../stores/financeStore.js';
    import {storeToRefs} from 'pinia';
    import Button from 'primevue/button';
    import Dialog from 'primevue/dialog';
    import InputNumber from 'primevue/inputnumber';
    import Calendar from 'primevue/calendar';
    import InputText from 'primevue/inputtext';
    import ConfirmDialog from 'primevue/confirmdialog';
    import {useConfirm} from 'primevue/useconfirm';
    import ProgressBar from 'primevue/progressbar';
    import Tag from 'primevue/tag';

    const route = useRoute();
    const router = useRouter();
    const confirm = useConfirm();
    const store = useFinanceStore();
    const creditoId = Number(route.params.id);

    const {inversiones} = storeToRefs(store);
    const {addPago, deletePago} = store;

    // Estado para el modal de pago
    const dialogPago = ref(false);
    const nuevoPago = ref({
      fecha: new Date(),
      monto: 0,
      descripcion: 'Pago de cuota'
    });

    // Encontramos el crédito específico
    const credito = computed(() => inversiones.value.find(inv => inv.id === creditoId));

    // Usamos el getter para filtrar los pagos de este crédito
    const pagos = computed(() => {
      return credito.value ? store.pagosPorCreditoId(creditoId) : [];
    });

    // Cálculos
    const totalPagado = computed(() => {
      return pagos.value.reduce((sum, pago) => sum + pago.monto, 0);
    });

    const saldoPendiente = computed(() => {
      if (!credito.value) return 0;
      return credito.value.montoTotal - totalPagado.value;
    });

    const porcentajePagado = computed(() => {
      if (!credito.value || !credito.value.montoTotal) return 0;
      const percentage = (totalPagado.value / credito.value.montoTotal) * 100;
      return Math.min(percentage, 100); // Asegura que no pase de 100%
    });

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
    };

    // Funciones
    const abrirDialogPago = () => {
      const montoMaximo = saldoPendiente.value > 0 ? saldoPendiente.value : 0;
      nuevoPago.value = {
        fecha: new Date(),
        monto: montoMaximo,
        descripcion: 'Pago de cuota'
      };
      dialogPago.value = true;
    };

    const guardarPago = () => {
      if (!nuevoPago.value.monto || nuevoPago.value.monto <= 0) {
        // Aquí podrías usar un toast de PrimeVue para una mejor UX
        alert('Por favor ingresa un monto válido');
        return;
      }

      addPago({
        creditoId: creditoId,
        fecha: nuevoPago.value.fecha.toISOString().slice(0, 10),
        monto: nuevoPago.value.monto,
        descripcion: nuevoPago.value.descripcion
      });

      dialogPago.value = false;
    };

    const handleDeletePago = (pagoId) => {
      confirm.require({
        message: '¿Estás seguro de que deseas eliminar este registro de pago?',
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
          deletePago(pagoId);
        }
      });
    };

    const getEstadoTag = (estado) => {
      switch (estado) {
        case 'activa': return { severity: 'info', text: 'Activa' };
        case 'pagada': return { severity: 'success', text: 'Pagada' };
        case 'vencida': return { severity: 'danger', text: 'Vencida' };
        default: return { severity: 'secondary', text: 'Otro' };
      }
    };

    const volver = () => {
      router.push('/inversiones');
    };
    </script>

    <template>
      <div v-if="credito" class="space-y-6">
        <ConfirmDialog/>

        <!-- Cabecera -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Detalle del Crédito</h1>
            <p class="text-gray-500 mt-1">Resumen y pagos del crédito a {{ credito.beneficiario }}.</p>
          </div>
          <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="volver" outlined/>
        </div>

        <!-- Datos del crédito -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm font-medium text-gray-500">Descripción</p>
              <p class="text-lg font-semibold text-gray-800">{{ credito.descripcion }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Monto del Préstamo</p>
              <p class="text-lg font-semibold text-gray-800">{{ formatCurrency(credito.montoInvertido) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Monto Total a Pagar</p>
              <p class="text-lg font-semibold text-blue-600">{{ formatCurrency(credito.montoTotal) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Fecha de Préstamo</p>
              <p class="text-lg font-semibold text-gray-800">{{ credito.fechaInversion }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Fecha de Vencimiento</p>
              <p class="text-lg font-semibold text-gray-800">{{ credito.fechaVencimiento }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Estado</p>
              <Tag :severity="getEstadoTag(credito.estado).severity" :value="getEstadoTag(credito.estado).text" rounded></Tag>
            </div>
          </div>
        </div>

        <!-- Estado de cuenta y Pagos -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-700">Estado de Cuenta</h2>
            <Button v-if="credito.estado !== 'pagada'" label="Registrar Pago" icon="pi pi-plus" @click="abrirDialogPago"/>
          </div>

          <!-- Resumen de Pagos -->
          <div class="mb-6">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-600">Progreso de Pago</span>
              <span class="font-bold text-gray-800">{{ formatCurrency(totalPagado) }} / {{ formatCurrency(credito.montoTotal) }}</span>
            </div>
            <ProgressBar :value="porcentajePagado" :showValue="false" style="height: 10px"></ProgressBar>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-gray-500">{{ porcentajePagado.toFixed(2) }}% Pagado</span>
              <span class="font-medium text-red-600">Pendiente: {{ formatCurrency(saldoPendiente) }}</span>
            </div>
          </div>

          <!-- Historial de Pagos -->
          <h3 class="text-lg font-semibold text-gray-700 mb-3">Historial de Pagos</h3>
          <div class="overflow-x-auto">
            <table v-if="pagos.length > 0" class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="pago in pagos" :key="pago.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ pago.fecha }}</td>
                <td class="px-4 py-3 text-sm text-gray-800">{{ pago.descripcion }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-green-600">{{ formatCurrency(pago.monto) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <Button icon="pi pi-trash" severity="danger" text rounded @click="handleDeletePago(pago.id)"/>
                </td>
              </tr>
              </tbody>
            </table>
            <div v-else class="text-center py-8 bg-gray-50 rounded-md">
              <i class="pi pi-info-circle text-4xl text-gray-400"></i>
              <p class="mt-2 text-gray-600">Aún no se han registrado pagos para este crédito.</p>
            </div>
          </div>
        </div>

        <!-- Modal de registro de pago -->
        <Dialog v-model:visible="dialogPago" modal header="Registrar Nuevo Pago" :style="{ width: '450px' }" class="p-fluid">
          <div class="space-y-4">
            <div>
              <label for="pago-monto" class="block mb-2 text-sm font-medium text-gray-700">Monto del Pago</label>
              <InputNumber id="pago-monto" v-model="nuevoPago.monto" mode="currency" currency="MXN" locale="es-MX" :max="saldoPendiente" :min="0.01" autofocus/>
            </div>
            <div>
              <label for="pago-fecha" class="block mb-2 text-sm font-medium text-gray-700">Fecha del Pago</label>
              <Calendar id="pago-fecha" v-model="nuevoPago.fecha" dateFormat="dd/mm/yy" showIcon/>
            </div>
            <div>
              <label for="pago-descripcion" class="block mb-2 text-sm font-medium text-gray-700">Descripción (Opcional)</label>
              <InputText id="pago-descripcion" v-model="nuevoPago.descripcion"/>
            </div>
          </div>
          <template #footer>
            <Button label="Cancelar" icon="pi pi-times" @click="dialogPago = false" text/>
            <Button label="Guardar Pago" icon="pi pi-check" @click="guardarPago"/>
          </template>
        </Dialog>
      </div>

      <!-- Mensaje si el crédito no se encuentra -->
      <div v-else class="text-center p-10 bg-white rounded-lg shadow-md">
        <i class="pi pi-exclamation-triangle text-5xl text-amber-500"></i>
        <h2 class="mt-4 text-2xl font-bold text-gray-800">Crédito no encontrado</h2>
        <p class="text-gray-500 mt-2">El crédito que buscas no existe o ha sido eliminado.</p>
        <Button icon="pi pi-arrow-left" label="Volver a Inversiones" @click="volver" class="mt-6"/>
      </div>
    </template>