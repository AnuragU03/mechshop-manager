<script setup>
import { ref } from 'vue'
import { login, setToken } from '../api.js'

const emit = defineEmits(['login'])
const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  const res = await login(username.value, password.value)
  if (res.token) {
    setToken(res.token)
    emit('login', res.user)
  } else {
    error.value = res.error || 'Login failed'
  }
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="username" placeholder="Username" class="w-full p-2 border rounded" required />
        <input v-model="password" type="password" placeholder="Password" class="w-full p-2 border rounded" required />
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template>
