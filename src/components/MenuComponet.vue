<script setup>
import {useRoute, useRouter} from 'vue-router';

defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['close-menu', 'toggle-collapse']);

const route = useRoute();
const router = useRouter();

const menuItems = [
  {
    category: 'Principal',
    items: [
      {name: 'Dashboard', route: '/dashboard', icon: 'dashboard'},
      {name: 'Reportes', route: '/reportes', icon: 'bar_chart'}
    ]
  },
  {
    category: 'Cuentas',
    items: [
      {name: 'Cuentas', route: '/cuentas', icon: 'account_balance'},
    ]
  },
  {
    category: 'Transacciones',
    items: [
      {name: 'Transacciones', route: '/transacciones', icon: 'swap_horiz'},
    ]
  },
  {
    category: 'Inversiones',
    items: [
      {name: 'Inversiones', route: '/inversiones', icon: 'attach_money'},
    ]
  },
];
const logout = () => {
  localStorage.removeItem('token');
  router.push('/');
  emit('close-menu');
};
</script>

<template>
  <div>
    <!-- Fondo oscuro para móvil -->
    <div
        v-if="isMobileOpen"
        @click="emit('close-menu')"
        class="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden"
    ></div>

    <!-- Menú Lateral -->
    <aside
        class="fixed inset-y-0 left-0 bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 ease-in-out z-30"
        :class="{
        'w-64': !collapsed,
        'w-20': collapsed,
        'translate-x-0': isMobileOpen,
        '-translate-x-full md:translate-x-0': !isMobileOpen
      }"
    >
      <!-- Cabecera del Menú -->
      <div class="flex items-center justify-between p-4 h-16 border-b border-gray-700 flex-shrink-0">
        <div class="flex items-center overflow-hidden">
          <img src="../assets/vue.svg" alt="Logo" class="h-8 w-8 flex-shrink-0"/>
          <h1 v-if="!collapsed" class="text-xl font-bold ml-2 text-white whitespace-nowrap">Finanzas</h1>
        </div>
        <!-- Emite el evento para colapsar el menú -->
        <button @click="emit('toggle-collapse')"
                class="hidden md:block p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
          <span class="material-icons">{{ collapsed ? 'menu_open' : 'chevron_left' }}</span>
        </button>
      </div>

      <!-- Navegación -->
      <nav class="flex-grow overflow-y-auto px-2 py-4 space-y-4">
        <div v-for="section in menuItems" :key="section.category">
          <h2 v-if="!collapsed" class="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase">{{
              section.category
            }}</h2>
          <hr v-if="collapsed" class="border-gray-700 mx-auto my-4 w-8">

          <router-link
              v-for="item in section.items"
              :key="item.route"
              :to="item.route"
              @click="emit('close-menu')"
              class="flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 group relative"
              :class="{
              'bg-indigo-600 text-white shadow-lg': route.path === item.route,
              'hover:bg-gray-700 hover:text-white': route.path !== item.route,
              'justify-center': collapsed
            }"
          >
            <span class="material-icons">{{ item.icon }}</span>
            <span v-if="!collapsed" class="ml-3 whitespace-nowrap">{{ item.name }}</span>
            <div v-if="collapsed"
                 class="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {{ item.name }}
            </div>
          </router-link>
        </div>
      </nav>

      <!-- Perfil de Usuario -->
      <div class="p-2 border-t border-gray-700 flex-shrink-0">
        <div class="flex items-center p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
          <img class="h-10 w-10 rounded-full object-cover" src="https://i.pravatar.cc/100?u=BalmoreRamirez"
               alt="Avatar">
          <div v-if="!collapsed" class="ml-3 overflow-hidden">
            <p class="text-sm font-semibold text-white whitespace-nowrap">BalmoreRamirez</p>
            <p class="text-xs text-gray-400 hover:text-white whitespace-nowrap">Ver perfil</p>
          </div>
        </div>
        <button
            @click="logout"
            class="w-full flex items-center mt-2 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200 group"
            :class="{ 'justify-center': collapsed }"
        >
          <span class="material-icons">logout</span>
          <span v-if="!collapsed" class="ml-3 whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  </div>
</template>