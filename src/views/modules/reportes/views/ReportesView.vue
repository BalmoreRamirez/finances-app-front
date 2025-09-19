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

// Estados para filtros y paginación
const selectedPeriod = ref('mes');
const currentPage = ref(1);
const itemsPerPage = ref(10);

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
        datasets: [{
          label: 'Capital',
          data: data.balanceByMonth,
          borderColor: '#5A5BFF',
          backgroundColor: 'rgba(90, 91, 255, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#5A5BFF',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
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

  if (cashFlowRef.value) {
    if (charts.cashFlow) charts.cashFlow.destroy();
    charts.cashFlow = new Chart(cashFlowRef.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Ingresos',
            data: data.incomeByMonth,
            backgroundColor: '#10B981',
            borderRadius: 4
          },
          {
            label: 'Gastos',
            data: data.expensesByMonth,
            backgroundColor: '#EF4444',
            borderRadius: 4
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
};

watch([() => store.transactions, () => store.categories, () => cuentasStore.cuentas, reportData], createCharts, { deep: true });
onMounted(createCharts);

// Paginación computada
const paginatedData = computed(() => {
  const data = reportData.value;
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;

  return {
    labels: data.labels.slice(startIndex, endIndex),
    incomeByMonth: data.incomeByMonth.slice(startIndex, endIndex),
    expensesByMonth: data.expensesByMonth.slice(startIndex, endIndex),
    balanceByMonth: data.balanceByMonth.slice(startIndex, endIndex)
  };
});

const totalPages = computed(() => Math.ceil(reportData.value.labels.length / itemsPerPage.value));

// Funciones de exportación
const exportToPDF = () => {
  // Lógica para exportar PDF
  console.log('Exportando a PDF...');
};

const exportByWeek = () => {
  // Lógica para exportar por semana
  console.log('Exportando por semana...');
};

const exportByMonth = () => {
  // Lógica para exportar por mes
  console.log('Exportando por mes...');
};

const exportByYear = () => {
  // Lógica para exportar por año
  console.log('Exportando por año...');
};

const formatCurrency = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header minimalista -->
    <header class="bg-background-white border-b border-neutral-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-text-primary">Reportes Financieros</h1>

        <!-- Controles de exportación -->
        <div class="flex items-center space-x-3">
          <button @click="exportToPDF" class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar PDF
          </button>

          <div class="flex items-center space-x-2">
            <button @click="exportByWeek" class="px-3 py-2 text-text-primary hover:bg-background-light rounded-lg transition-colors">
              Semana
            </button>
            <button @click="exportByMonth" class="px-3 py-2 text-text-primary hover:bg-background-light rounded-lg transition-colors">
              Mes
            </button>
            <button @click="exportByYear" class="px-3 py-2 text-text-primary hover:bg-background-light rounded-lg transition-colors">
              Año
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-6 py-8">
      <!-- Resumen de Capital -->
      <div class="mb-8 bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
        <h2 class="text-xl font-semibold mb-6 text-text-primary">Capital Total</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-4 bg-background-light rounded-lg">
            <div class="w-12 h-12 bg-success-500 bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p class="text-sm text-text-muted mb-1">Efectivo</p>
            <p class="text-2xl font-semibold text-success-500">{{ formatCurrency(totalEfectivo) }}</p>
          </div>

          <div class="text-center p-4 bg-background-light rounded-lg">
            <div class="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p class="text-sm text-text-muted mb-1">Banco</p>
            <p class="text-2xl font-semibold text-primary">{{ formatCurrency(totalBanco) }}</p>
          </div>

          <div class="text-center p-4 bg-background-light rounded-lg">
            <div class="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p class="text-sm text-text-muted mb-1">Capital Total</p>
            <p class="text-3xl font-bold text-gradient">{{ formatCurrency(capitalTotal) }}</p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 class="text-lg font-semibold mb-4 text-text-primary">Evolución del Capital</h3>
          <div class="h-80">
            <canvas ref="balanceHistoryRef"></canvas>
          </div>
        </div>

        <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 p-6">
          <h3 class="text-lg font-semibold mb-4 text-text-primary">Flujo de Efectivo</h3>
          <div class="h-80">
            <canvas ref="cashFlowRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Tabla con Paginación -->
      <div class="bg-background-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-100">
          <h3 class="text-lg font-semibold text-text-primary">Resumen Anual</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-100">
            <thead class="bg-background-light">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Mes</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Ingresos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Gastos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Balance del Mes</th>
              </tr>
            </thead>
            <tbody class="bg-background-white divide-y divide-neutral-50">
              <tr v-for="(label, index) in paginatedData.labels" :key="index" class="hover:bg-background-light transition-colors">
                <td class="px-6 py-4 font-medium text-text-primary">{{ label }}</td>
                <td class="px-6 py-4 text-success-500 font-medium">{{ formatCurrency(paginatedData.incomeByMonth[index]) }}</td>
                <td class="px-6 py-4 text-danger-500 font-medium">{{ formatCurrency(paginatedData.expensesByMonth[index]) }}</td>
                <td class="px-6 py-4 font-semibold" :class="(paginatedData.incomeByMonth[index] - paginatedData.expensesByMonth[index]) >= 0 ? 'text-success-500' : 'text-danger-500'">
                  {{ formatCurrency(paginatedData.incomeByMonth[index] - paginatedData.expensesByMonth[index]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div class="flex items-center text-sm text-text-muted">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, reportData.labels.length) }} de {{ reportData.labels.length }} registros
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-text-primary bg-background-light rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            <span class="px-3 py-2 text-sm font-medium text-text-primary">
              {{ currentPage }} de {{ totalPages }}
            </span>

            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-text-primary bg-background-light rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
