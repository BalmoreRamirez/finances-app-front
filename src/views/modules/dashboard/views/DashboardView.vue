<script setup>
    import { ref, onMounted, computed, watch } from 'vue';
    import Chart from 'chart.js/auto';
    import { useFinanceStore } from '../../../../stores/financeStore.js';
    import { storeToRefs } from 'pinia';

    const store = useFinanceStore();
    // Fallback a array vacío si el getter no existe o es undefined
    const { ingresos = ref([]), gastos = ref([]), balanceGeneral } = storeToRefs(store);

    const activeTab = ref('overview');
    const tabs = ['overview', 'income', 'expenses'];



    const totalIngresosMes = computed(() => {
      const arr = ingresos?.value || [];
      const now = new Date();
      return arr
        .filter(i => new Date(i.fecha).getMonth() === now.getMonth() && new Date(i.fecha).getFullYear() === now.getFullYear())
        .reduce((sum, i) => sum + i.monto, 0);
    });

    const totalGastosMes = computed(() => {
      const arr = gastos?.value || [];
      const now = new Date();
      return arr
        .filter(g => new Date(g.fecha).getMonth() === now.getMonth() && new Date(g.fecha).getFullYear() === now.getFullYear())
        .reduce((sum, g) => sum + g.monto, 0);
    });

    const incomeCategoryData = computed(() => {
      const arr = ingresos?.value || [];
      if (!arr.length) return { labels: [], data: [] };
      const data = arr.reduce((acc, ingreso) => {
        acc[ingreso.categoria] = (acc[ingreso.categoria] || 0) + ingreso.monto;
        return acc;
      }, {});
      return { labels: Object.keys(data), data: Object.values(data) };
    });

    const expenseCategoryData = computed(() => {
      const arr = gastos?.value || [];
      if (!arr.length) return { labels: [], data: [] };
      const data = arr.reduce((acc, gasto) => {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
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
        if (new Date(i.fecha).getFullYear() === currentYear) {
          const month = new Date(i.fecha).getMonth();
          incomeByMonth[month] += i.monto;
        }
      });
      (gastos?.value || []).forEach(g => {
        if (new Date(g.fecha).getFullYear() === currentYear) {
          const month = new Date(g.fecha).getMonth();
          expensesByMonth[month] += g.monto;
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

    watch([() => store.ingresos, () => store.gastos, activeTab], () => {
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