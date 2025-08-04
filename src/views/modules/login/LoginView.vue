<template>
                <div class="flex items-center justify-center min-h-screen bg-gray-100">
                  <div class="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row">
                    <!-- Branding -->
                    <section class="w-full md:w-1/2 bg-blue-600 p-8 flex flex-col justify-center items-center">
                      <img src="/finan.svg" alt="Logo" class="w-20 h-20 mb-4" />
                      <h1 class="text-white text-2xl font-bold mb-2 text-center">FinanceApp</h1>
                      <p class="text-blue-200 text-center text-sm">Controla tus finanzas personales de manera inteligente.</p>
                    </section>
                    <!-- Login -->
                    <section class="w-full md:w-1/2 p-6 flex flex-col justify-center">
                      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
                      <div class="space-y-4">
                        <div>
                          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Correo electrónico</label>
                          <InputText
                            id="email"
                            v-model.trim="email"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            class="border rounded w-full py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :disabled="loading"
                            aria-label="Correo electrónico"
                          />
                          <span v-if="v$.email.$error" class="text-red-500 text-xs">Correo inválido</span>
                        </div>
                        <div>
                          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                          <Password
                            id="password"
                            v-model.trim="password"
                            toggleMask
                            class="!w-full"
                            :disabled="loading"
                            aria-label="Contraseña"
                            inputStyle="padding-left: 1rem; padding-right: 1rem;"
                          />
                          <span v-if="v$.password.$error" class="text-red-500 text-xs">Contraseña requerida</span>
                        </div>
                        <p v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">{{ error }}</p>
                        <div>
                          <button
                            @click="login"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center"
                            :disabled="loading || v$.$invalid"
                            aria-busy="loading"
                          >
                            <span v-if="loading" class="material-icons animate-spin mr-2">autorenew</span>
                            <span>{{ loading ? "Entrando..." : "Entrar" }}</span>
                          </button>
                        </div>
                        <div class="text-center mt-2">
                          <a href="#" class="font-bold text-sm text-blue-500 hover:text-blue-800">¿Olvidaste tu contraseña?</a>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </template>

              <script setup>
              import { ref } from "vue";
              import { useVuelidate } from "@vuelidate/core";
              import { required, email as emailRule } from "@vuelidate/validators";
              import InputText from "primevue/inputtext";
              import Password from "primevue/password";
              import { useRouter } from "vue-router";
              import authService from "../../../services/auth.js";

              const router = useRouter();
              const email = ref("");
              const password = ref("");
              const error = ref("");
              const loading = ref(false);

              const rules = {
                email: { required, email: emailRule },
                password: { required }
              };

              const v$ = useVuelidate(rules, { email, password });

              const login = async () => {
                v$.value.$touch();
                if (v$.value.$invalid) return;
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
                  error.value = err.response?.data?.message || "Error al iniciar sesión";
                } finally {
                  loading.value = false;
                }
              };
              </script>

              <style scoped>
              @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
              .material-icons.animate-spin {
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                100% { transform: rotate(360deg); }
              }
            
              </style>