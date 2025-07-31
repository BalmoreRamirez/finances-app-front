<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div
      class="flex w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
    >
      <!-- Branding -->
      <div
        class="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-center items-center"
      >
        <img src="/finan.svg" alt="Logo" class="w-24 h-24 mb-4" />
        <h1 class="text-white text-3xl font-bold mb-2">FinanceApp</h1>
        <p class="text-blue-200 text-center">
          Controla tus finanzas personales de manera inteligente.
        </p>
      </div>

      <!-- Formulario -->
      <div class="w-full md:w-1/2 p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          Iniciar Sesión
        </h2>
        <form @submit.prevent="login" autocomplete="on">
          <div class="mb-4 relative">
            <label
              for="email"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Correo electrónico</label
            >
            <span
              class="material-icons absolute left-3 top-10 text-gray-400 pointer-events-none"
              >email</span
            >
            <input
              id="email"
              v-model.trim="email"
              type="email"
              autocomplete="username"
              class="shadow-sm appearance-none border rounded w-full py-3 px-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              :disabled="loading"
            />
          </div>
          <div class="mb-6 relative">
            <label
              for="password"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Contraseña</label
            >
            <span
              class="material-icons absolute left-3 top-10 text-gray-400 pointer-events-none"
              >lock</span
            >
            <input
              id="password"
              v-model.trim="password"
              type="password"
              autocomplete="current-password"
              class="shadow-sm appearance-none border rounded w-full py-3 px-10 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              :disabled="loading"
            />
          </div>

          <transition name="fade">
            <p
              v-if="error"
              class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              {{ error }}
            </p>
          </transition>

          <div class="flex items-center justify-between">
            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 flex items-center justify-center"
              :disabled="loading"
            >
              <span v-if="loading" class="material-icons animate-spin mr-2"
                >autorenew</span
              >
              <span>{{ loading ? "Entrando..." : "Entrar" }}</span>
            </button>
          </div>
          <div class="text-center mt-4">
            <a
              href="#"
              class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "../../../services/auth.js";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const login = async () => {
  error.value = "";
  loading.value = true;
  try {
    const response = await authService.login(email.value, password.value);
    if (!response.data || !response.data.accessToken) {
      throw new Error("No se recibió un token de acceso válido");
    }
    localStorage.setItem("accessToken", response.data.accessToken);
    router.push("/dashboard");
  } catch (err) {
    if (err.response) {
      error.value = err.response.data.message || "Error al iniciar sesión";
    } else {
      error.value = "Error de red o servidor no disponible";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

/* Ajuste para la posición del icono en el input */
label + .material-icons {
  top: 2.6rem;
}
.material-icons.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
