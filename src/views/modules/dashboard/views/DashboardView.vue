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
    const tabs = ['overview', 'income', 'expenses'];
    const connectionStatus = ref('checking'); // 'checking', 'connected', 'disconnected', 'slow'
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
              { label: 'Ingresos', data: data.income, borderColor: '#1D4634', tension: 0.3 },
              { label: 'Egresos', data: data.expenses, borderColor: '#DF9B6A', tension: 0.3 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
      if (activeTab.value === 'income' && incomePieRef.value) {
        if (charts.incomePie) charts.incomePie.destroy();
        charts.incomePie = new Chart(incomePieRef.value.getContext('2d'), {
          type: 'doughnut',
          data: { labels: incomeCategoryData.value.labels, datasets: [{ data: incomeCategoryData.value.data }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Ingresos por categoría' } } }
        });
      }
      if (activeTab.value === 'expenses' && expensePieRef.value) {
        if (charts.expensePie) charts.expensePie.destroy();
        charts.expensePie = new Chart(expensePieRef.value.getContext('2d'), {
          type: 'doughnut',
          data: { labels: expenseCategoryData.value.labels, datasets: [{ data: expenseCategoryData.value.data }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Gastos por categoría' } } }
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
      <div>
        <header class="bg-finance-700 text-background p-6">
          <h1 class="text-2xl font-bold">Panel Financiero</h1>
        </header>

        <!-- Banner de estado de conectividad -->
        <div v-if="connectionStatus !== 'connected'" class="w-full px-4 py-2 text-center text-sm transition-all duration-300" 
             :class="{
               'bg-yellow-100 text-yellow-800 border-b border-yellow-200': connectionStatus === 'checking',
               'bg-red-100 text-red-800 border-b border-red-200': connectionStatus === 'disconnected',
               'bg-orange-100 text-orange-800 border-b border-orange-200': connectionStatus === 'slow'
             }">
          <div class="flex items-center justify-center space-x-2">
            <span v-if="connectionStatus === 'checking'" class="inline-block w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></span>
            <span v-else-if="connectionStatus === 'disconnected'" class="material-icons text-sm">cloud_off</span>
            <span v-else-if="connectionStatus === 'slow'" class="material-icons text-sm">hourglass_top</span>
            
            <span v-if="connectionStatus === 'checking'">Cargando datos del servidor...</span>
            <span v-else-if="connectionStatus === 'disconnected'">
              Sin conexión al servidor. El servicio puede estar iniciándose.
              <button @click="checkConnectionStatus" class="ml-2 underline hover:no-underline">Reintentar</button>
            </span>
            <span v-else-if="connectionStatus === 'slow'">
              Conexión lenta detectada. El servidor puede estar iniciándose.
            </span>
          </div>
        </div>

        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-background-subtle rounded-lg shadow p-6 border-l-4 border-finance-500">
              <h2 class="text-neutral-700 font-semibold mb-2">Ingresos (Mes)</h2>
              <p class="text-finance-500 text-2xl font-bold">{{ formatCurrency(totalIngresosMes) }}</p>
            </div>
            <div class="bg-background-subtle rounded-lg shadow p-6 border-l-4 border-accent-500">
              <h2 class="text-neutral-700 font-semibold mb-2">Egresos (Mes)</h2>
              <p class="text-accent-700 text-2xl font-bold">{{ formatCurrency(totalGastosMes) }}</p>
            </div>
            <div class="bg-background-subtle rounded-lg shadow p-6 border-l-4 border-neutral-500">
              <h2 class="text-neutral-700 font-semibold mb-2">Capital Total</h2>
              <p class="text-neutral-900 text-2xl font-bold">{{ formatCurrency(balanceGeneral) }}</p>
            </div>
          </div>

          <div class="mt-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                        :class="[activeTab === tab ? 'border-finance-500 text-finance-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize']">
                  {{ tab }}
                </button>
              </nav>
            </div>

            <div v-if="activeTab === 'overview'" class="mt-6 bg-background-light rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-4 text-finance-700">Flujo de Efectivo Anual</h2>
              <div class="h-96"><canvas ref="lineChartRef"></canvas></div>
            </div>

            <div v-if="activeTab === 'income'" class="mt-6 bg-background-light rounded-lg shadow p-6">
               <h2 class="text-xl font-bold mb-4 text-finance-700">Ingresos por Categoría</h2>
              <div class="h-96"><canvas ref="incomePieRef"></canvas></div>
            </div>

            <div v-if="activeTab === 'expenses'" class="mt-6 bg-background-light rounded-lg shadow p-6">
               <h2 class="text-xl font-bold mb-4 text-finance-700">Gastos por Categoría</h2>
              <div class="h-96"><canvas ref="expensePieRef"></canvas></div>
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