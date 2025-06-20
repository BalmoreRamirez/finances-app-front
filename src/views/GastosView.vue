<script setup>
import { ref } from 'vue';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const gastos = ref([
  { id: 1, descripcion: 'Renta Departamento', categoria: 'Vivienda', monto: 12000, fecha: '2024-05-05' },
  { id: 2, descripcion: 'Compra semanal de supermercado', categoria: 'Alimentación', monto: 2500, fecha: '2024-05-10' },
  { id: 3, descripcion: 'Pago de servicio de Internet', categoria: 'Servicios', monto: 650, fecha: '2024-05-12' },
  { id: 4, descripcion: 'Cena con amigos', categoria: 'Ocio', monto: 800, fecha: '2024-05-18' },
  { id: 5, descripcion: 'Gasolina', categoria: 'Transporte', monto: 1000, fecha: '2024-05-25' },
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Gastos</h1>
        <p class="text-gray-500 mt-1">Controla y categoriza todas tus salidas de dinero.</p>
      </div>
      <button class="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors">
        <span class="material-icons">add_circle_outline</span>
        <span>Agregar Gasto</span>
      </button>
    </div>

    <!-- Tabla de Gastos -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ gasto.descripcion }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ gasto.categoria }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-red-600 font-semibold">{{ formatCurrency(gasto.monto) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ gasto.fecha }}</td>
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