<script setup>
import { ref } from 'vue';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const ingresos = ref([
  { id: 1, descripcion: 'Salario Mensual - Mayo', monto: 35000, fecha: '2024-05-01' },
  { id: 2, descripcion: 'Proyecto Freelance - Cliente A', monto: 12500, fecha: '2024-05-15' },
  { id: 3, descripcion: 'Venta de equipo usado', monto: 4800, fecha: '2024-05-20' },
  { id: 4, descripcion: 'Rendimiento de Inversiones', monto: 2100, fecha: '2024-05-28' },
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Ingresos</h1>
        <p class="text-gray-500 mt-1">Registra y administra tus fuentes de ingresos.</p>
      </div>
      <button class="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
        <span class="material-icons">add_circle_outline</span>
        <span>Agregar Ingreso</span>
      </button>
    </div>

    <!-- Tabla de Ingresos -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ingreso in ingresos" :key="ingreso.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ ingreso.descripcion }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-green-600 font-semibold">{{ formatCurrency(ingreso.monto) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ ingreso.fecha }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900">Editar</button>
                <button class="text-red-600 hover:text-red-900">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>