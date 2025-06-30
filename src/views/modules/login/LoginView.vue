<template>
        <div class="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
          <h2 class="text-2xl font-bold mb-4">Iniciar Sesión</h2>
          <form @submit.prevent="login">
            <div class="mb-4">
              <label class="block mb-1">Correo electrónico</label>
              <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required/>
            </div>
            <div class="mb-4">
              <label class="block mb-1">Contraseña</label>
              <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required/>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Entrar</button>
            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
          </form>
        </div>
      </template>

      <script setup>
      import { ref } from 'vue';
      import { useRouter } from 'vue-router';
      import axios from 'axios';

      const router = useRouter();
      const email = ref('');
      const password = ref('');
      const error = ref('');

      const login = async () => {
        error.value = '';
        try {
          const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: email.value,
            password: password.value
          });
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