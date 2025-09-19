<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuComponent from '../../components/MenuComponet.vue';

const route = useRoute();
const isMobileMenuOpen = ref(false);
const isMenuCollapsed = ref(false);

const pageTitle = computed(() => {
  return route.name ? String(route.name).charAt(0).toUpperCase() + String(route.name).slice(1) : 'Dashboard';
});
</script>

<template>
  <div class="relative min-h-screen bg-background">
    <MenuComponent
        :is-mobile-open="isMobileMenuOpen"
        :collapsed="isMenuCollapsed"
        @close-menu="isMobileMenuOpen = false"
        @toggle-collapse="isMenuCollapsed = !isMenuCollapsed"
    />

    <main
        class="flex-1 transition-all duration-300 ease-out"
        :class="{
          'md:ml-72': !isMenuCollapsed,
          'md:ml-20': isMenuCollapsed
        }"
    >
      <!-- Header para móvil -->
      <header class="flex items-center justify-between h-16 px-4 bg-background-white border-b border-neutral-200 md:hidden shadow-sm">
        <button
          @click="isMobileMenuOpen = true"
          class="flex items-center justify-center w-10 h-10 rounded-lg text-text-primary hover:bg-background-light transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-text-primary">{{ pageTitle }}</h1>
        <div class="w-10"></div> <!-- Spacer para centrar el título -->
      </header>

      <!-- Contenido principal -->
      <div class="min-h-[calc(100vh-4rem)] md:min-h-screen">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Asegurar que las transiciones sean suaves */
main {
  will-change: margin-left;
}

/* Scrollbar personalizado para el contenido principal */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
