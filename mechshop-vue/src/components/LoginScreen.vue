<script setup>
import { ref } from 'vue'
const emit = defineEmits(['login'])
const props = defineProps({ setLoading: Function })

const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password.'
    return
  }
  props.setLoading(true)
  // Demo: simple authentication
  setTimeout(() => {
    props.setLoading(false)
    if (username.value === 'admin' && password.value === 'admin') {
      emit('login', { username: username.value, role: 'admin' })
    } else {
      error.value = 'Invalid credentials.'
    }
  }, 800)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <h2 class="text-2xl font-bold mb-6 text-center">MechShop Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input v-model="username" type="text" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input v-model="password" type="password" class="w-full p-2 border rounded" required />
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template> 