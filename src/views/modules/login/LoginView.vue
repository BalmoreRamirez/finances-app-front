<template>
        <div class="flex items-center justify-center min-h-screen bg-gray-100">
          <div class="flex w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
            <!-- Columna de Branding -->
            <div class="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-center items-center">
              <img src="/finan.svg" alt="Logo" class="w-24 h-24 mb-4">
              <h1 class="text-white text-3xl font-bold mb-2">FinanceApp</h1>
              <p class="text-blue-200 text-center">Controla tus finanzas personales de manera inteligente.</p>
            </div>

            <!-- Columna del Formulario -->
            <div class="w-full md:w-1/2 p-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
              <form @submit.prevent="login">
                <div class="mb-4 relative">
                  <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Correo electrónico</label>
                  <span class="material-icons absolute left-3 top-10 text-gray-400">email</span>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    class="shadow-sm appearance-none border rounded w-full py-3 px-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div class="mb-6 relative">
                  <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                   <span class="material-icons absolute left-3 top-10 text-gray-400">lock</span>
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    class="shadow-sm appearance-none border rounded w-full py-3 px-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <p v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  {{ error }}
                </p>

                <div class="flex items-center justify-between">
                  <button
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
                  >
                    Entrar
                  </button>
                </div>
                <div class="text-center mt-4">
                  <a href="#" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </template>

      <script setup>
      import { ref } from 'vue';
      import { useRouter } from 'vue-router';
      import authService from "../../../services/authService.js";


      const router = useRouter();
      const email = ref('');
      const password = ref('');
      const error = ref('');

      const login = async () => {
        error.value = '';
        try {
          const response = await authService.login(email.value, password.value);
          localStorage.setItem('token', response.data.token);
          router.push('/dashboard');
        } catch (err) {
          if (err.response) {
            error.value = err.response.data.message || 'Error al iniciar sesión';
          } else {
            error.value = 'Error de red o servidor no disponible';
          }
        }
      };
      </script>

      <style scoped>
      /* Asegúrate de tener Material Icons disponible o usa SVGs */
      @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

      /* Ajuste para la posición del icono en el input */
      label + .material-icons {
        top: 2.6rem; /* Ajusta este valor si es necesario */
      }
      </style>