<script setup>
            import {ref, computed} from 'vue';
            import {useFinanceStore} from '../../../../stores/financeStore.js';
            import {storeToRefs} from 'pinia';
            import {useConfirm} from "primevue/useconfirm";

            import GastoModal from '../components/GastoModal.vue';
            import GastoFijoModal from '../components/GastoFijoModal.vue';
            import Button from 'primevue/button';
            import ConfirmDialog from 'primevue/confirmdialog';
            import TabView from 'primevue/tabview';
            import TabPanel from 'primevue/tabpanel';

            const store = useFinanceStore();
            const confirm = useConfirm();

            // Obtenemos gastosFijos desde el store
            const {gastos, cuentas, gastosFijos} = storeToRefs(store);
            const {deleteGasto, addGasto, updateGasto, addGastoFijo, updateGastoFijo, deleteGastoFijo} = store;

            // Estados para los dos modales
            const showGastoModal = ref(false);
            const gastoToEdit = ref(null);
            const showGastoFijoModal = ref(false);
            const gastoFijoToEdit = ref(null);

            // Formateador de moneda
            const formatCurrency = (value) => {
              if (typeof value !== 'number') return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(0);
              return new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(value);
            };

            // Cálculos para tarjetas de resumen
            const totalGastosVariables = computed(() =>
                gastos.value.reduce((sum, gasto) => sum + gasto.monto, 0)
            );

            const totalGastosFijos = computed(() =>
                gastosFijos.value.reduce((sum, gasto) => sum + gasto.monto, 0)
            );

            const gastoTotal = computed(() =>
                totalGastosVariables.value + totalGastosFijos.value
            );

            // Funciones para gestionar gastos variables
            const openCreateGastoModal = () => {
              gastoToEdit.value = {
                id: null,
                descripcion: '',
                monto: null,
                categoria: 'Varios',
                fecha: new Date().toISOString().slice(0, 10),
                cuentaId: null
              };
              showGastoModal.value = true;
            };

            const openEditGastoModal = (gasto) => {
              gastoToEdit.value = {...gasto};
              showGastoModal.value = true;
            };

            const handleDeleteGasto = (id) => {
              confirm.require({
                message: '¿Estás seguro de que deseas eliminar este gasto?',
                header: 'Confirmar eliminación',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                accept: () => {
                  deleteGasto(id);
                },
              });
            };

            const handleSaveGasto = (gastoData) => {
              if (gastoData.id) {
                updateGasto(gastoData);
              } else {
                addGasto(gastoData);
              }
              showGastoModal.value = false;
            };

            // Nuevas funciones para gestionar gastos fijos
            const openCreateGastoFijoModal = () => {
              gastoFijoToEdit.value = {
                id: null,
                descripcion: '',
                monto: null,
                categoria: 'Varios',
                diaPago: 1
              };
              showGastoFijoModal.value = true;
            };

            const openEditGastoFijoModal = (gastoFijo) => {
              gastoFijoToEdit.value = {...gastoFijo};
              showGastoFijoModal.value = true;
            };

            const handleDeleteGastoFijo = (id) => {
              confirm.require({
                message: '¿Estás seguro de que deseas eliminar este gasto fijo?',
                header: 'Confirmar eliminación',
                icon: 'pi pi-exclamation-triangle',
                acceptClass: 'p-button-danger',
                accept: () => {
                  deleteGastoFijo(id);
                },
              });
            };

            const handleSaveGastoFijo = (gastoFijoData) => {
              if (gastoFijoData.id) {
                updateGastoFijo(gastoFijoData);
              } else {
                addGastoFijo(gastoFijoData);
              }
              showGastoFijoModal.value = false;
            };
            </script>

            <template>
              <div class="space-y-8">
                <ConfirmDialog/>

                <!-- Cabecera -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 class="text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
                    <p class="text-gray-500 mt-1">Controla y categoriza todas tus salidas de dinero.</p>
                  </div>

                  <!-- Botones de acción -->
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button @click="openCreateGastoModal"
                            class="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors">
                      <span class="material-icons">add_circle_outline</span>
                      <span>Agregar Gasto Variable</span>
                    </button>

                    <button @click="openCreateGastoFijoModal"
                            class="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                      <span class="material-icons">calendar_month</span>
                      <span>Agregar Gasto Fijo</span>
                    </button>
                  </div>
                </div>

                <!-- Tarjetas de Resumen -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Card Gastos Variables -->
                  <div class="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
                    <div class="bg-yellow-100 p-3 rounded-full">
                      <span class="material-icons text-yellow-600 text-3xl">trending_down</span>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Gastos Variables (Mes)</p>
                      <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(totalGastosVariables) }}</p>
                    </div>
                  </div>
                  <!-- Card Gastos Fijos -->
                  <div class="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
                    <div class="bg-blue-100 p-3 rounded-full">
                      <span class="material-icons text-blue-600 text-3xl">repeat</span>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Gastos Fijos (Mes)</p>
                      <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(totalGastosFijos) }}</p>
                    </div>
                  </div>
                  <!-- Card Gasto Total -->
                  <div class="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
                    <div class="bg-red-100 p-3 rounded-full">
                      <span class="material-icons text-red-600 text-3xl">receipt_long</span>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Gasto Total (Mes)</p>
                      <p class="text-2xl font-bold text-red-600">{{ formatCurrency(gastoTotal) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Contenido principal con TabView -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                  <TabView>
                    <!-- Panel de Gastos Variables -->
                    <TabPanel header="Gastos Variables">
                      <div class="p-4">
                        <div class="overflow-x-auto">
                          <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                            <tr>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-gray-50">
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ gasto.descripcion }}</div>
                                <div class="text-xs text-gray-500">{{ gasto.categoria }} - {{ gasto.fecha }}</div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{{ formatCurrency(gasto.monto) }}</td>
                              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button icon="pi pi-pencil" severity="info" text rounded @click="openEditGastoModal(gasto)"/>
                                <Button icon="pi pi-trash" severity="danger" text rounded @click="handleDeleteGasto(gasto.id)"/>
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabPanel>

                    <!-- Panel de Gastos Fijos -->
                    <TabPanel header="Gastos Fijos">
                      <div class="p-4">
                        <div class="overflow-x-auto">
                          <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                            <tr>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día de Pago</th>
                              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="gasto in gastosFijos" :key="gasto.id" class="hover:bg-gray-50">
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ gasto.descripcion }}</div>
                                <div class="text-xs text-gray-500">{{ gasto.categoria }}</div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                {{ formatCurrency(gasto.monto) }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Día {{ gasto.diaPago }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button icon="pi pi-pencil" severity="info" text rounded @click="openEditGastoFijoModal(gasto)"/>
                                <Button icon="pi pi-trash" severity="danger" text rounded @click="handleDeleteGastoFijo(gasto.id)"/>
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabPanel>
                  </TabView>
                </div>

                <!-- Modales -->
                <GastoModal
                    v-model:visible="showGastoModal"
                    :gasto-to-edit="gastoToEdit"
                    :cuentas="cuentas"
                    @save="handleSaveGasto"
                />

                <GastoFijoModal
                    v-model:visible="showGastoFijoModal"
                    :gasto-fijo-to-edit="gastoFijoToEdit"
                    @save="handleSaveGastoFijo"
                />
              </div>
            </template>