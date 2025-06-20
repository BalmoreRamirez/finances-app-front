<script setup>
import {ref, onMounted} from 'vue';
import Chart from 'chart.js/auto';

// Referencias para los gráficos
const balanceHistoryRef = ref(null);
const cashFlowRef = ref(null);
let charts = {balanceHistory: null, cashFlow: null};

// Datos para los reportes
const balanceData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  data: [3500, 4200, 4800, 4300, 5100, 4700]
};

const cashFlowData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  income: [9500, 10200, 11000, 10500, 12000, 12500],
  expenses: [6000, 6000, 6200, 6200, 6900, 7800],
  balance: [3500, 4200, 4800, 4300, 5100, 4700]
};

const createCharts = () => {
  // Gráfico de evolución del capital
  if (balanceHistoryRef.value) {
    if (charts.balanceHistory) charts.balanceHistory.destroy();

    charts.balanceHistory = new Chart(balanceHistoryRef.value.getContext('2d'), {
      type: 'line',
      data: {
        labels: balanceData.labels,
        datasets: [{
          label: 'Capital',
          data: balanceData.data,
          backgroundColor: '#1D4634',
          borderColor: '#1D4634',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolución del Capital'
          }
        }
      }
    });
  }

  // Gráfico de flujo de efectivo
  if (cashFlowRef.value) {
    if (charts.cashFlow) charts.cashFlow.destroy();

    charts.cashFlow = new Chart(cashFlowRef.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels: cashFlowData.labels,
        datasets: [
          {
            label: 'Ingresos',
            data: cashFlowData.income,
            backgroundColor: '#5E8470',
          },
          {
            label: 'Egresos',
            data: cashFlowData.expenses,
            backgroundColor: '#DF9B6A',
          },
          {
            label: 'Balance',
            type: 'line',
            data: cashFlowData.balance,
            backgroundColor: '#1D4634',
            borderColor: '#1D4634',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Análisis de Flujo de Efectivo'
          }
        }
      }
    });
  }
};

onMounted(() => {
  createCharts();
});
</script>

<template>
  <!-- Contenido principal -->
  <div>
    <header class="bg-finance-700 text-background p-6">
      <h1 class="text-2xl font-bold">Reportes Financieros</h1>
    </header>

    <div class="container mx-auto px-4 py-8">
      <!-- Gráficas de reportes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Evolución del Capital -->
        <div class="bg-background-light rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 text-finance-700">Evolución del Capital</h2>
          <div class="h-80">
            <canvas ref="balanceHistoryRef"></canvas>
          </div>
        </div>

        <!-- Flujo de Efectivo -->
        <div class="bg-background-light rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 text-finance-700">Flujo de Efectivo</h2>
          <div class="h-80">
            <canvas ref="cashFlowRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Tabla de resumen anual -->
      <div class="mt-10 bg-background-light rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-4 text-finance-700">Resumen Anual</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ingresos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Gastos</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Balance</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
            <tr v-for="(_, index) in cashFlowData.labels" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                {{ cashFlowData.labels[index] }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                ${{ cashFlowData.income[index].toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                ${{ cashFlowData.expenses[index].toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  :class="cashFlowData.balance[index] >= 0 ? 'text-finance-500' : 'text-accent-700'">
                ${{ cashFlowData.balance[index].toLocaleString('es-MX', {minimumFractionDigits: 2}) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</template>