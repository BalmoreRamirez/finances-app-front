<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useTransaccionesStore } from '../../../../stores/transactionStore.js';
import { useCuentasStore } from '../../../../stores/accountStore.js';
import { storeToRefs } from 'pinia';

const store = useTransaccionesStore();
const cuentasStore = useCuentasStore();
const { transacciones, ingresos, gastos, accounts, categories, isLoading } = storeToRefs(store);
const { capitalTotal, totalEfectivo, totalBanco } = storeToRefs(cuentasStore);
const { fetchTransactions, fetchAccounts, fetchCategories } = store;
const { fetchAccounts: fetchCuentas } = cuentasStore;

const activeTab = ref('overview');
const tabs = [
  { id: 'overview', name: 'Resumen', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'income', name: 'Ingresos', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'expenses', name: 'Gastos', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' }
];
const connectionStatus = ref('checking');
const retryAttempts = ref(0);

    // Función para verificar estado de conectividad
    const checkConnectionStatus = async () => {
      connectionStatus.value = 'checking';
      const startTime = Date.now();
      
      try {
        await fetchTransactions();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (responseTime > 10000) { // Más de 10 segundos
          connectionStatus.value = 'slow';
        } else {
          connectionStatus.value = 'connected';
        }
        retryAttempts.value = 0;
      } catch (error) {
        connectionStatus.value = 'disconnected';
        console.error('Error de conectividad:', error);
      }
    };

    // Cargar datos al montar
    onMounted(async () => {
      try {
        connectionStatus.value = 'checking';
        await Promise.all([
          fetchTransactions(),
          fetchAccounts(), 
          fetchCategories(),
          fetchCuentas()
        ]);
        connectionStatus.value = 'connected';
      } catch (error) {
        connectionStatus.value = 'disconnected';
        console.error('Error inicial de carga:', error);
      }
    });

    const totalIngresosMes = computed(() => {
      const arr = ingresos?.value || [];
      const now = new Date();
      return arr
        .filter(i => {
          const fecha = new Date(i.date || i.fecha);
          return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
        })
        .reduce((sum, i) => sum + parseFloat(i.amount || i.monto || 0), 0);
    });

    const totalGastosMes = computed(() => {
      const arr = gastos?.value || [];
      const now = new Date();
      return arr
        .filter(g => {
          const fecha = new Date(g.date || g.fecha);
          return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
        })
        .reduce((sum, g) => sum + parseFloat(g.amount || g.monto || 0), 0);
    });

    const balanceGeneral = computed(() => {
      // Capital total = suma de efectivo y banco
      return capitalTotal.value || 0;
    });

    const getCategoryName = (categoryId) => {
      const categoria = categories.value.find(c => c.id === categoryId);
      return categoria?.name || 'Sin categoría';
    };

    const incomeCategoryData = computed(() => {
      const arr = ingresos?.value || [];
      if (!arr.length) return { labels: [], data: [] };
      const data = arr.reduce((acc, ingreso) => {
        const categoryName = getCategoryName(ingreso.category_id || ingreso.categoria);
        acc[categoryName] = (acc[categoryName] || 0) + parseFloat(ingreso.amount || ingreso.monto || 0);
        return acc;
      }, {});
      return { labels: Object.keys(data), data: Object.values(data) };
    });

    const expenseCategoryData = computed(() => {
      const arr = gastos?.value || [];
      if (!arr.length) return { labels: [], data: [] };
      const data = arr.reduce((acc, gasto) => {
        const categoryName = getCategoryName(gasto.category_id || gasto.categoria);
        acc[categoryName] = (acc[categoryName] || 0) + parseFloat(gasto.amount || gasto.monto || 0);
        return acc;
      }, {});
      return { labels: Object.keys(data), data: Object.values(data) };
    });


    const lineChartData = computed(() => {
      const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const incomeByMonth = Array(12).fill(0);
      const expensesByMonth = Array(12).fill(0);
      const currentYear = new Date().getFullYear();

      (ingresos?.value || []).forEach(i => {
        const fecha = new Date(i.date || i.fecha);
        if (fecha.getFullYear() === currentYear) {
          const month = fecha.getMonth();
          incomeByMonth[month] += parseFloat(i.amount || i.monto || 0);
        }
      });
      
      (gastos?.value || []).forEach(g => {
        const fecha = new Date(g.date || g.fecha);
        if (fecha.getFullYear() === currentYear) {
          const month = fecha.getMonth();
          expensesByMonth[month] += parseFloat(g.amount || g.monto || 0);
        }
      });

      return { labels, income: incomeByMonth, expenses: expensesByMonth };
    });

    const lineChartRef = ref(null);
    const incomePieRef = ref(null);
    const expensePieRef = ref(null);
    let charts = { line: null, incomePie: null, expensePie: null };

    const createCharts = () => {
      if (activeTab.value === 'overview' && lineChartRef.value) {
        if (charts.line) charts.line.destroy();
        const data = lineChartData.value;
        charts.line = new Chart(lineChartRef.value.getContext('2d'), {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Ingresos',
                data: data.income,
                borderColor: '#5A5BFF',
                backgroundColor: 'rgba(90, 91, 255, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#5A5BFF',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
              },
              {
                label: 'Gastos',
                data: data.expenses,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#EF4444',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  color: '#475259'
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#475259' }
              },
              y: {
                grid: { color: 'rgba(71, 82, 89, 0.1)' },
                ticks: { color: '#475259' }
              }
            }
          }
        });
      }

      if (activeTab.value === 'income' && incomePieRef.value) {
        if (charts.incomePie) charts.incomePie.destroy();
        charts.incomePie = new Chart(incomePieRef.value.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: incomeCategoryData.value.labels,
            datasets: [{
              data: incomeCategoryData.value.data,
              backgroundColor: [
                '#5A5BFF',
                '#10B981',
                '#8505A6',
                '#F59E0B',
                '#EF4444',
                '#6366F1'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#475259',
                  usePointStyle: true
                }
              }
            }
          }
        });
      }

      if (activeTab.value === 'expenses' && expensePieRef.value) {
        if (charts.expensePie) charts.expensePie.destroy();
        charts.expensePie = new Chart(expensePieRef.value.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: expenseCategoryData.value.labels,
            datasets: [{
              data: expenseCategoryData.value.data,
              backgroundColor: [
                '#EF4444',
                '#F59E0B',
                '#8505A6',
                '#6366F1',
                '#10B981',
                '#5A5BFF'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#475259',
                  usePointStyle: true
                }
              }
            }
          }
        });
      }
    };

    watch([() => store.transactions, () => store.categories, activeTab], () => {
      setTimeout(createCharts, 50);
    }, { deep: true });

    onMounted(createCharts);

    const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header minimalista -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-text-primary">Dashboard Financiero</h1>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full" :class="{
            'bg-warning-500 animate-pulse': connectionStatus === 'checking',
            'bg-success-500': connectionStatus === 'connected',
            'bg-danger-500': connectionStatus === 'disconnected',
            'bg-warning-500': connectionStatus === 'slow'
          }"></div>
          <span class="text-sm text-text-muted">
            {{ connectionStatus === 'connected' ? 'Conectado' :
               connectionStatus === 'checking' ? 'Cargando...' :
               connectionStatus === 'slow' ? 'Conexión lenta' : 'Sin conexión' }}
          </span>
        </div>
      </div>
    </header>

    <!-- Banner de estado de conectividad -->
    <div v-if="connectionStatus !== 'connected'" class="w-full px-4 py-3 text-center text-sm transition-all duration-300"
         :class="{
           'bg-warning-50 text-warning-700 border-b border-warning-100': connectionStatus === 'checking',
           'bg-danger-50 text-danger-700 border-b border-danger-100': connectionStatus === 'disconnected',
           'bg-warning-50 text-warning-700 border-b border-warning-100': connectionStatus === 'slow'
         }">
      <div class="flex items-center justify-center space-x-2">
        <svg v-if="connectionStatus === 'checking'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else-if="connectionStatus === 'disconnected'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
        </svg>
        <svg v-else-if="connectionStatus === 'slow'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <span v-if="connectionStatus === 'checking'">Cargando datos del servidor...</span>
        <span v-else-if="connectionStatus === 'disconnected'">
          Sin conexión al servidor.
          <button @click="checkConnectionStatus" class="ml-2 text-primary underline hover:no-underline">Reintentar</button>
        </span>
        <span v-else-if="connectionStatus === 'slow'">Conexión lenta detectada.</span>
      </div>
    </div>

    <div class="container mx-auto px-6 py-8">
      <!-- Tarjetas de resumen -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Ingresos del Mes</p>
              <p class="text-2xl font-semibold text-success-500">{{ formatCurrency(totalIngresosMes) }}</p>
            </div>
            <div class="w-12 h-12 bg-success-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Gastos del Mes</p>
              <p class="text-2xl font-semibold text-danger-500">{{ formatCurrency(totalGastosMes) }}</p>
            </div>
            <div class="w-12 h-12 bg-danger-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-text-muted mb-1">Capital Total</p>
              <p class="text-2xl font-bold text-gradient">{{ formatCurrency(balanceGeneral) }}</p>
            </div>
            <div class="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación de pestañas -->
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div class="border-b border-neutral-100">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-neutral-300',
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
              </svg>
              <span>{{ tab.name }}</span>
            </button>
          </nav>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="p-6">
          <div v-if="activeTab === 'overview'">
            <h2 class="text-xl font-semibold mb-6 text-text-primary">Flujo de Efectivo Anual</h2>
            <div class="h-96">
              <canvas ref="lineChartRef"></canvas>
            </div>
          </div>

          <div v-if="activeTab === 'income'">
            <h2 class="text-xl font-semibold mb-6 text-text-primary">Ingresos por Categoría</h2>
            <div class="h-96">
              <canvas ref="incomePieRef"></canvas>
            </div>
          </div>

          <div v-if="activeTab === 'expenses'">
            <h2 class="text-xl font-semibold mb-6 text-text-primary">Gastos por Categoría</h2>
            <div class="h-96">
              <canvas ref="expensePieRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 16px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
