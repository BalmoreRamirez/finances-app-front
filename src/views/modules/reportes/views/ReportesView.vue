<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import Chart from 'chart.js/auto';
  import { useTransaccionesStore } from '../../../../stores/transactionStore.js';
  import { useCuentasStore } from '../../../../stores/accountStore.js';
  import { storeToRefs } from 'pinia';

  const store = useTransaccionesStore();
  const cuentasStore = useCuentasStore();
  const { transacciones, ingresos, gastos, categories, isLoading } = storeToRefs(store);
  const { capitalTotal, totalEfectivo, totalBanco, cuentas } = storeToRefs(cuentasStore);
  const { fetchTransactions, fetchCategories } = store;
  const { fetchAccounts } = cuentasStore;

  // Cargar datos al montar
  onMounted(async () => {
    await Promise.all([
      fetchTransactions(),
      fetchCategories(),
      fetchAccounts()
    ]);
  });

  // --- DATOS COMPUTADOS PARA REPORTES ---

  const reportData = computed(() => {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const incomeByMonth = Array(12).fill(0);
    const expensesByMonth = Array(12).fill(0);
    const balanceByMonth = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    // Asegura arrays válidos
    const ingresosArr = ingresos?.value || [];
    const gastosArr = gastos?.value || [];

    // Capital inicial: suma de cuentas de efectivo y banco
    const capitalInicial = capitalTotal.value || 0;

    // Calcular balance inicial de años anteriores (movimientos de transacciones)
    let cumulativeTransactionBalance = [...ingresosArr, ...gastosArr]
      .filter(t => {
        const fecha = new Date(t.date || t.fecha);
        return fecha.getFullYear() < currentYear;
      })
      .reduce((acc, t) => {
        const amount = parseFloat(t.amount || t.monto || 0);
        const categoria = categories.value.find(c => c.id === t.category_id);
        const esIngreso = categoria?.type === 'ingreso';
        return acc + (esIngreso ? amount : -amount);
      }, 0);

    // Balance inicial total = capital de cuentas + movimientos de años anteriores
    let cumulativeBalance = capitalInicial;

    // Procesar datos del año actual
    labels.forEach((_, monthIndex) => {
      const monthlyIncome = ingresosArr
        .filter(i => {
          const fecha = new Date(i.date || i.fecha);
          return fecha.getFullYear() === currentYear && fecha.getMonth() === monthIndex;
        })
        .reduce((sum, i) => sum + parseFloat(i.amount || i.monto || 0), 0);

      const monthlyExpenses = gastosArr
        .filter(g => {
          const fecha = new Date(g.date || g.fecha);
          return fecha.getFullYear() === currentYear && fecha.getMonth() === monthIndex;
        })
        .reduce((sum, g) => sum + parseFloat(g.amount || g.monto || 0), 0);

      incomeByMonth[monthIndex] = monthlyIncome;
      expensesByMonth[monthIndex] = monthlyExpenses;
      cumulativeBalance += monthlyIncome - monthlyExpenses;
      balanceByMonth[monthIndex] = cumulativeBalance;
    });

    return { labels, incomeByMonth, expensesByMonth, balanceByMonth };
  });


  // --- LÓGICA DE GRÁFICOS ---

  const balanceHistoryRef = ref(null);
  const cashFlowRef = ref(null);
  let charts = { balanceHistory: null, cashFlow: null };

  const createCharts = () => {
    const data = reportData.value;

    if (balanceHistoryRef.value) {
      if (charts.balanceHistory) charts.balanceHistory.destroy();
      charts.balanceHistory = new Chart(balanceHistoryRef.value.getContext('2d'), {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{ label: 'Capital', data: data.balanceByMonth, borderColor: '#1D4634', tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Evolución del Capital' } } }
      });
    }

    if (cashFlowRef.value) {
      if (charts.cashFlow) charts.cashFlow.destroy();
      charts.cashFlow = new Chart(cashFlowRef.value.getContext('2d'), {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            { label: 'Ingresos', data: data.incomeByMonth, backgroundColor: '#5E8470' },
            { label: 'Gastos', data: data.expensesByMonth, backgroundColor: '#DF9B6A' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Análisis de Flujo de Efectivo' } } }
      });
    }
  };

  watch([() => store.transactions, () => store.categories, () => cuentasStore.cuentas, reportData], createCharts, { deep: true });
  onMounted(createCharts);

  const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  </script>

  <template>
    <div>
      <header class="bg-finance-700 text-background p-6">
        <h1 class="text-2xl font-bold">Reportes Financieros</h1>
      </header>

      <div class="container mx-auto px-4 py-8">
        <!-- Resumen de Capital -->
        <div class="mb-6 bg-background-light rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 text-finance-700">Capital Total</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-sm text-neutral-600">Efectivo</p>
              <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalEfectivo) }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-neutral-600">Banco</p>
              <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(totalBanco) }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-neutral-600">Capital Total</p>
              <p class="text-3xl font-bold text-finance-700">{{ formatCurrency(capitalTotal) }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-background-light rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4 text-finance-700">Evolución del Capital</h2>
            <div class="h-80">
              <canvas ref="balanceHistoryRef"></canvas>
            </div>
          </div>
          <div class="bg-background-light rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4 text-finance-700">Flujo de Efectivo</h2>
            <div class="h-80">
              <canvas ref="cashFlowRef"></canvas>
            </div>
          </div>
        </div>

        <div class="mt-10 bg-background-light rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 text-finance-700">Resumen Anual</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200">
              <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Mes</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ingresos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Gastos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Balance del Mes</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="(label, index) in reportData.labels" :key="index">
                <td class="px-6 py-4 font-medium text-neutral-900">{{ label }}</td>
                <td class="px-6 py-4 text-green-600">{{ formatCurrency(reportData.incomeByMonth[index]) }}</td>
                <td class="px-6 py-4 text-red-600">{{ formatCurrency(reportData.expensesByMonth[index]) }}</td>
                <td class="px-6 py-4 font-medium" :class="(reportData.incomeByMonth[index] - reportData.expensesByMonth[index]) >= 0 ? 'text-finance-500' : 'text-accent-700'">
                  {{ formatCurrency(reportData.incomeByMonth[index] - reportData.expensesByMonth[index]) }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>