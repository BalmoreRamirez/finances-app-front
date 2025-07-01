<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuComponent from '../../components/MenuComponet.vue'; // Ajusta la ruta si es necesario

const route = useRoute();
const isMobileMenuOpen = ref(false);
const isMenuCollapsed = ref(false);

const pageTitle = computed(() => {
  return route.name ? String(route.name).charAt(0).toUpperCase() + String(route.name).slice(1) : 'Dashboard';
});
</script>

<template>
  <div class="relative min-h-screen bg-gray-100">
    <MenuComponent
        :is-mobile-open="isMobileMenuOpen"
        :collapsed="isMenuCollapsed"
        @close-menu="isMobileMenuOpen = false"
        @toggle-collapse="isMenuCollapsed = !isMenuCollapsed"
    />
    <main
        class="flex-1 transition-all duration-300"
        :class="{
        'md:ml-64': !isMenuCollapsed,
        'md:ml-20': isMenuCollapsed
      }"
    >
      <header class="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 md:justify-end">
        <button @click="isMobileMenuOpen = true" class="text-gray-600 md:hidden">
          <span class="material-icons">menu</span>
        </button>
        <h1 class="text-xl font-semibold text-gray-800 md:hidden">{{ pageTitle }}</h1>
        <div></div>
      </header>
      <div class="p-4 md:p-6">
        <!-- Aquí se renderizarán las vistas hijas como dashboard, cuentas, etc. -->
        <router-view />
      </div>
    </main>
  </div>
</template>
