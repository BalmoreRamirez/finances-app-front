<script setup>
import {ref, onMounted, computed} from 'vue';
import Chart from 'chart.js/auto';

// Estado para el período seleccionado y vista activa
const selectedPeriod = ref('month');
const activeTab = ref('overview');
const periods = ['month', 'week', 'day'];
const tabs = ['overview', 'income', 'expenses'];

// Datos financieros de ejemplo
const financialData = ref({
  income: 12500,
  expenses: 7800,
  balance: 4700,
  // Categorías de ingresos
  incomeCategories: [
    {name: 'Salario', amount: 8500, color: '#1D4634'},
    {name: 'Inversiones', amount: 2000, color: '#5E8470'},
    {name: 'Freelance', amount: 1500, color: '#A7C2B5'},
    {name: 'Otros', amount: 500, color: '#DFEAE5'}
  ],
  // Categorías de gastos
  expenseCategories: [
    {name: 'Vivienda', amount: 3000, color: '#DF9B6A'},
    {name: 'Alimentación', amount: 1800, color: '#E8B991'},
    {name: 'Transporte', amount: 800, color: '#F5DABE'},
    {name: 'Servicios', amount: 1200, color: '#B47849'},
    {name: 'Entretenimiento', amount: 600, color: '#8A5834'},
    {name: 'Otros', amount: 400, color: '#6E6B68'}
  ]
});

// Referencias para los gráficos
const lineChartRef = ref(null);
const incomePieRef = ref(null);
const expensePieRef = ref(null);
let charts = {
  line: null,
  incomePie: null,
  expensePie: null
};

// Configuración de gráficos por período
const chartData = {
  month: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    income: [9500, 10200, 11000, 10500, 12000, 12500],
    expenses: [7200, 7500, 7300, 7600, 7900, 7800]
  },
  week: {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    income: [1800, 1500, 1900, 2100, 2300, 1800, 1100],
    expenses: [1200, 950, 1100, 1300, 1600, 1000, 650]
  },
  day: {
    labels: ['8h', '10h', '12h', '14h', '16h', '18h', '20h'],
    income: [300, 450, 600, 400, 350, 200, 100],
    expenses: [150, 200, 500, 300, 250, 100, 50]
  }
};

// Datos procesados para gráficos de categorías
const incomeCategoryData = computed(() => ({
  labels: financialData.value.incomeCategories.map(cat => cat.name),
  data: financialData.value.incomeCategories.map(cat => cat.amount),
  backgroundColor: financialData.value.incomeCategories.map(cat => cat.color)
}));

const expenseCategoryData = computed(() => ({
  labels: financialData.value.expenseCategories.map(cat => cat.name),
  data: financialData.value.expenseCategories.map(cat => cat.amount),
  backgroundColor: financialData.value.expenseCategories.map(cat => cat.color)
}));

// Crear los gráficos
const createCharts = () => {
  createLineChart();
  createPieCharts();
};

const createLineChart = () => {
  if (!lineChartRef.value) return;

  const ctx = lineChartRef.value.getContext('2d');

  if (charts.line) {
    charts.line.destroy();
  }

  const data = chartData[selectedPeriod.value];

  charts.line = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Ingresos',
          data: data.income,
          backgroundColor: '#1D4634',
          borderColor: '#1D4634',
          tension: 0.3,
        },
        {
          label: 'Egresos',
          data: data.expenses,
          backgroundColor: '#DF9B6A',
          borderColor: '#DF9B6A',
          tension: 0.3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Flujo de efectivo'
        }
      }
    }
  });
};

const createPieCharts = () => {
  // Gráfico de ingresos
  if (incomePieRef.value) {
    if (charts.incomePie) {
      charts.incomePie.destroy();
    }

    charts.incomePie = new Chart(incomePieRef.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: incomeCategoryData.value.labels,
        datasets: [{
          data: incomeCategoryData.value.data,
          backgroundColor: incomeCategoryData.value.backgroundColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Ingresos por categoría'
          }
        }
      }
    });
  }

  // Gráfico de gastos
  if (expensePieRef.value) {
    if (charts.expensePie) {
      charts.expensePie.destroy();
    }

    charts.expensePie = new Chart(expensePieRef.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: expenseCategoryData.value.labels,
        datasets: [{
          data: expenseCategoryData.value.data,
          backgroundColor: expenseCategoryData.value.backgroundColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Gastos por categoría'
          }
        }
      }
    });
  }
};

// Cambiar período de tiempo
const changePeriod = (period) => {
  selectedPeriod.value = period;
  createLineChart();
};

// Cambiar entre pestañas
const changeTab = (tab) => {
  activeTab.value = tab;
  setTimeout(() => {
    createCharts();
  }, 100);
};

onMounted(() => {
  createCharts();
});
</script>

<template>
  <div>
    <!-- Cabecera -->
    <header class="bg-finance-700 text-background p-6">
      <h1 class="text-2xl font-bold">Panel Financiero</h1>
    </header>

    <!-- Tarjetas de resumen -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Ingresos -->
        <div
            class="bg-background-subtle rounded-lg shadow p-6 border-l-4 border-finance-500 transition-all hover:shadow-lg">
          <h2 class="text-neutral-700 font-semibold mb-2">Ingresos</h2>
          <p class="text-finance-500 text-2xl font-bold">
            ${{ financialData.income.toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
          </p>
        </div>

        <!-- Egresos -->
        <div
            class="bg-background-subtle rounded-lg shadow p-6 border-l-4 border-accent-500 transition-all hover:shadow-lg">
          <h2 class="text-neutral-700 font-semibold mb-2">Egresos</h2>
          <p class="text-accent-700 text-2xl font-bold">
            ${{ financialData.expenses.toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
          </p>
        </div>

        <!-- Capital -->
        <div
            class="bg-background-subtle rounded-lg shadow p-6 border-l-4 border-neutral-500 transition-all hover:shadow-lg">
          <h2 class="text-neutral-700 font-semibold mb-2">Capital</h2>
          <p class="text-neutral-900 text-2xl font-bold">
            ${{ financialData.balance.toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
          </p>
        </div>
      </div>

      <!-- Navegación de pestañas -->
      <div class="mt-10 border-b border-neutral-200">
        <nav class="flex space-x-4">
          <button
              v-for="tab in tabs"
              :key="tab"
              @click="changeTab(tab)"
              :class="[
                      'py-3 px-4 font-medium text-sm border-b-2 transition-colors',
                      activeTab === tab
                        ? 'border-finance-500 text-finance-500'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                    ]"
          >
            {{
              tab === 'overview' ? 'Resumen' :
                  tab === 'income' ? 'Ingresos' : 'Gastos'
            }}
          </button>
        </nav>
      </div>

      <!-- Contenido de pestañas -->
      <div class="mt-6">
        <!-- Pestaña de resumen -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <!-- Selector de período -->
          <div class="flex justify-end space-x-2 mb-4">
            <button
                v-for="period in periods"
                :key="period"
                @click="changePeriod(period)"
                :class="[
                        'px-4 py-2 rounded-md text-sm transition-colors',
                        selectedPeriod === period
                          ? 'bg-finance-500 text-background'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      ]"
            >
              {{ period === 'month' ? 'Mes' : period === 'week' ? 'Semana' : 'Día' }}
            </button>
          </div>

          <!-- Gráfica lineal -->
          <div class="bg-background-light rounded-lg shadow p-6">
            <div class="h-80">
              <canvas ref="lineChartRef"></canvas>
            </div>
          </div>

          <!-- Gráficas de categorías -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-background-light rounded-lg shadow p-6">
              <div class="h-64">
                <canvas ref="incomePieRef"></canvas>
              </div>
            </div>
            <div class="bg-background-light rounded-lg shadow p-6">
              <div class="h-64">
                <canvas ref="expensePieRef"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña de ingresos -->
        <div v-if="activeTab === 'income'" class="space-y-6">
          <div class="bg-background-light rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4 text-finance-700">Detalles de Ingresos</h2>

            <!-- Gráfica de categorías de ingresos -->
            <div class="h-80 mb-6">
              <canvas ref="incomePieRef"></canvas>
            </div>

            <!-- Tabla de ingresos -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-neutral-200">
                <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Monto
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-for="(category, index) in financialData.incomeCategories" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: category.color }"></div>
                      <div class="text-sm font-medium text-neutral-900">{{ category.name }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    ${{ category.amount.toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {{ ((category.amount / financialData.income) * 100).toFixed(1) }}%
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pestaña de gastos -->
        <div v-if="activeTab === 'expenses'" class="space-y-6">
          <div class="bg-background-light rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4 text-accent-700">Detalles de Gastos</h2>

            <!-- Gráfica de categorías de gastos -->
            <div class="h-80 mb-6">
              <canvas ref="expensePieRef"></canvas>
            </div>

            <!-- Tabla de gastos -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-neutral-200">
                <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Monto
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-neutral-200">
                <tr v-for="(category, index) in financialData.expenseCategories" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: category.color }"></div>
                      <div class="text-sm font-medium text-neutral-900">{{ category.name }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    ${{ category.amount.toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {{ ((category.amount / financialData.expenses) * 100).toFixed(1) }}%
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>