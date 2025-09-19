<script setup>
import {useRoute, useRouter} from 'vue-router';
import { ref, computed } from 'vue';

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
const showUserMenu = ref(false);

const menuItems = [
  {
    category: 'Principal',
    items: [
      {
        name: 'Dashboard',
        route: '/dashboard',
        icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        description: 'Resumen general'
      },
      {
        name: 'Reportes',
        route: '/reportes',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        description: 'Análisis y estadísticas'
      }
    ]
  },
  {
    category: 'Gestión',
    items: [
      {
        name: 'Cuentas',
        route: '/cuentas',
        icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        description: 'Administrar cuentas'
      },
      {
        name: 'Transacciones',
        route: '/transacciones',
        icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
        description: 'Historial de movimientos'
      }
    ]
  },
  {
    category: 'Inversiones',
    items: [
      {
        name: 'Inversiones',
        route: '/inversiones',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
        description: 'Portafolio de inversiones'
      }
    ]
  }
];

const currentUser = {
  name: 'BalmoreRamirez',
  email: 'balmore@example.com',
  avatar: 'https://i.pravatar.cc/100?u=BalmoreRamirez'
};

const isActiveRoute = (itemRoute) => {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/');
};

const logout = () => {
  localStorage.removeItem('accessToken');
  router.push('/login');
  emit('close-menu');
  showUserMenu.value = false;
};
</script>

<template>
  <div>
    <!-- Overlay para móvil -->
    <div
        v-if="isMobileOpen"
        @click="emit('close-menu')"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 md:hidden"
    ></div>

    <!-- Menú Lateral Principal -->
    <aside
        class="fixed inset-y-0 left-0 flex flex-col transition-all duration-300 ease-out z-50 bg-background-white/95 backdrop-blur-xl border-r border-neutral-200/80 shadow-xl"
        :class="{
        'w-72': !collapsed,
        'w-20': collapsed,
        'translate-x-0': isMobileOpen,
        '-translate-x-full md:translate-x-0': !isMobileOpen
      }"
    >
      <!-- Header del menú -->
      <div class="flex items-center justify-between p-6 h-20 border-b border-neutral-100/80 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div class="flex items-center overflow-hidden">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
            </svg>
          </div>
          <div v-if="!collapsed" class="ml-4 transition-all duration-300">
            <h1 class="text-xl font-bold text-gradient">FinanceApp</h1>
            <p class="text-xs text-text-muted">Gestión Inteligente</p>
          </div>
        </div>

        <button
          @click="emit('toggle-collapse')"
          class="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all duration-200"
        >
          <svg class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': collapsed }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Navegación Principal -->
      <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <div v-for="section in menuItems" :key="section.category" class="space-y-3">
          <!-- Título de sección -->
          <div v-if="!collapsed" class="flex items-center space-x-2 px-3">
            <div class="w-4 h-px bg-gradient-to-r from-primary to-transparent"></div>
            <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider">{{ section.category }}</h3>
          </div>
          <div v-else class="h-px bg-gradient-to-r from-neutral-200 to-transparent mx-2"></div>

          <!-- Items de navegación -->
          <div class="space-y-1">
            <router-link
                v-for="item in section.items"
                :key="item.route"
                :to="item.route"
                @click="emit('close-menu')"
                class="group relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium"
                :class="{
                'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-[1.02]': isActiveRoute(item.route),
                'text-text-primary hover:bg-background-light hover:text-primary hover:scale-[1.01]': !isActiveRoute(item.route),
                'justify-center': collapsed
              }"
            >
              <!-- Icono -->
              <div class="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                     :class="{ 'text-white': isActiveRoute(item.route), 'text-text-muted group-hover:text-primary': !isActiveRoute(item.route) }"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                </svg>
              </div>

              <!-- Contenido del item -->
              <div v-if="!collapsed" class="ml-4 flex-1 min-w-0">
                <div class="font-medium truncate">{{ item.name }}</div>
                <div class="text-xs opacity-75 truncate">{{ item.description }}</div>
              </div>

              <!-- Indicador activo -->
              <div v-if="isActiveRoute(item.route) && !collapsed"
                   class="w-2 h-2 rounded-full bg-white/80 shadow-sm"></div>

              <!-- Tooltip para modo colapsado -->
              <div v-if="collapsed"
                   class="absolute left-full ml-3 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-xs text-neutral-300">{{ item.description }}</div>
                <div class="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full">
                  <div class="w-2 h-2 bg-neutral-900 rotate-45"></div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Sección de Usuario -->
      <div class="p-4 border-t border-neutral-100/80 bg-gradient-to-r from-background-light to-background-white">
        <div class="relative">
          <!-- Perfil de usuario -->
          <button
            @click="showUserMenu = !showUserMenu"
            class="w-full flex items-center p-3 rounded-xl hover:bg-background-light transition-all duration-200 group"
            :class="{ 'justify-center': collapsed }"
          >
            <div class="relative">
              <img
                :src="currentUser.avatar"
                :alt="currentUser.name"
                class="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-200"
              >
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full"></div>
            </div>

            <div v-if="!collapsed" class="ml-3 flex-1 text-left">
              <p class="text-sm font-semibold text-text-primary truncate">{{ currentUser.name }}</p>
              <p class="text-xs text-text-muted truncate">{{ currentUser.email }}</p>
            </div>

            <svg v-if="!collapsed" class="w-4 h-4 text-text-muted transition-transform duration-200"
                 :class="{ 'rotate-180': showUserMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Menú desplegable de usuario -->
          <div v-if="showUserMenu && !collapsed"
               class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden transform transition-all duration-200 origin-bottom">
            <div class="p-2 space-y-1">
              <button class="w-full flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-light rounded-lg transition-colors">
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </button>
              <button class="w-full flex items-center px-3 py-2 text-sm text-text-primary hover:bg-background-light rounded-lg transition-colors">
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </button>
              <hr class="border-neutral-100 my-1">
              <button
                @click="logout"
                class="w-full flex items-center px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Botón de logout para modo colapsado -->
        <button
            v-if="collapsed"
            @click="logout"
            class="w-full flex items-center justify-center mt-3 p-3 rounded-xl text-danger-500 hover:bg-danger-50 transition-all duration-200 group relative"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>

          <!-- Tooltip para logout -->
          <div class="absolute left-full ml-3 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            Cerrar Sesión
            <div class="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full">
              <div class="w-2 h-2 bg-neutral-900 rotate-45"></div>
            </div>
          </div>
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* Animaciones personalizadas */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.group:hover .group-hover\:animate-slideIn {
  animation: slideInLeft 0.2s ease-out;
}

/* Efectos de glassmorphism */
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Scrollbar personalizado */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
